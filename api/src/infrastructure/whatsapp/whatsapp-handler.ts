import { Logger } from '@nestjs/common';
import { BaileysService } from './baileys.service';
import { NlpClientService } from './nlp-client.service';
import { SessionStore } from './session-store';
import type { IUserRepository } from '../../domain/repositories/user.repository.interface';
import { ListAppointmentsUseCase } from '../../application/use-cases/appointment/list-appointments.use-case';
import { CreateAppointmentUseCase } from '../../application/use-cases/appointment/create-appointment.use-case';
import { CancelAppointmentUseCase } from '../../application/use-cases/appointment/cancel-appointment.use-case';
import { UpdateAppointmentUseCase } from '../../application/use-cases/appointment/update-appointment.use-case';
import { CreateReminderUseCase } from '../../application/use-cases/reminder/create-reminder.use-case';
import { Appointment } from '../../domain/entities/appointment.entity';

export class WhatsAppHandler {
  private readonly logger = new Logger(WhatsAppHandler.name);
  private readonly sessionStore = new SessionStore();

  constructor(
    private readonly baileys: BaileysService,
    private readonly nlp: NlpClientService,
    private readonly userRepo: IUserRepository,
    private readonly listAppointments: ListAppointmentsUseCase,
    private readonly createAppointment: CreateAppointmentUseCase,
    private readonly cancelAppointment: CancelAppointmentUseCase,
    private readonly updateAppointment: UpdateAppointmentUseCase,
    private readonly createReminder: CreateReminderUseCase,
  ) {
    this.baileys.setMessageHandler(this.handle.bind(this));
  }

  async handle(jid: string, text: string, audioBase64?: string): Promise<void> {
    const user = await this.userRepo.findByWhatsappJid(jid);
    if (!user) {
      await this.baileys.sendText(jid, 'Você não tem acesso. Solicite um convite ao administrador.');
      return;
    }

    this.sessionStore.addMessage(jid, 'user', text || '[áudio]');
    const session = this.sessionStore.getOrCreate(jid);

    const nlpResponse = await this.nlp.process({
      jid,
      text: text || null,
      audio_base64: audioBase64 ?? null,
      history: session.history.slice(-10),
    });

    let replyText = nlpResponse.reply_text;

    try {
      if (nlpResponse.needs_confirmation) {
        this.sessionStore.setPending(jid, nlpResponse.intent, nlpResponse.entities as Record<string, unknown>);
      } else if (session.pendingIntent && this.isConfirmation(text)) {
        replyText = await this.executePending(jid, user.id, session.pendingIntent!, session.pendingEntities);
        this.sessionStore.clearPending(jid);
      } else if (!nlpResponse.needs_confirmation) {
        replyText = await this.executeIntent(nlpResponse.intent, nlpResponse.entities as Record<string, unknown>, user.id) ?? replyText;
        this.sessionStore.clearPending(jid);
      }
    } catch (err: any) {
      this.logger.error(`Intent execution error: ${err.message}`);
      replyText = 'Ocorreu um erro ao processar seu pedido. Tente novamente.';
    }

    this.sessionStore.addMessage(jid, 'bot', replyText);
    await this.baileys.sendText(jid, replyText);
  }

  private isConfirmation(text: string): boolean {
    return /^(sim|s|yes|confirmo|pode|ok)$/i.test(text.trim());
  }

  private async executePending(_jid: string, userId: string, intent: string, entities: Record<string, unknown>): Promise<string> {
    return (await this.executeIntent(intent, entities, userId)) ?? 'Pronto!';
  }

  private async executeIntent(intent: string, entities: Record<string, unknown>, userId: string): Promise<string | null> {
    switch (intent) {
      case 'create_appointment':
        return this.handleCreate(entities, userId);
      case 'query_appointments':
        return this.handleQuery(userId);
      case 'cancel_appointment':
        return this.handleCancel(entities, userId);
      default:
        return null;
    }
  }

  private async handleCreate(entities: Record<string, unknown>, userId: string): Promise<string> {
    const startTime = this.parseDateTime(entities.date as string, entities.time as string);
    if (!startTime) return 'Não consegui identificar a data e hora. Pode repetir?';

    const appointment = await this.createAppointment.execute({
      title: (entities.title as string) ?? 'Compromisso',
      startTime,
      categoryId: (entities.categoryId as string) ?? '',
      createdVia: 'whatsapp',
      userId,
    });

    return `Compromisso "${appointment.title}" marcado para ${this.formatDate(appointment.startTime)}.`;
  }

  private async handleQuery(userId: string): Promise<string> {
    const now = new Date();
    const end = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
    const appointments = await this.listAppointments.execute({ start: now, end }, userId);

    if (appointments.length === 0) return 'Você não tem compromissos nos próximos 7 dias.';

    const lines = appointments.slice(0, 5).map((a: Appointment) => `• ${a.title} — ${this.formatDate(a.startTime)}`);
    return `Seus próximos compromissos:\n${lines.join('\n')}`;
  }

  private async handleCancel(entities: Record<string, unknown>, userId: string): Promise<string> {
    const title = entities.title as string;
    if (!title) return 'Qual compromisso você quer cancelar?';

    const appointments = await this.listAppointments.execute({}, userId);
    const match = appointments.find((a: Appointment) => a.title.toLowerCase().includes(title.toLowerCase()));
    if (!match) return `Não encontrei nenhum compromisso com "${title}".`;

    await this.cancelAppointment.execute(match.id, userId);
    return `Compromisso "${match.title}" cancelado.`;
  }

  private parseDateTime(date: string | undefined, time: string | undefined): Date | null {
    if (!date) return null;
    const [h, m] = (time ?? '09:00').split(':').map(Number);
    const d = new Date(`${date}T${String(h).padStart(2, '0')}:${String(m ?? 0).padStart(2, '0')}:00-03:00`);
    return isNaN(d.getTime()) ? null : d;
  }

  private formatDate(date: Date): string {
    return date.toLocaleString('pt-BR', { timeZone: 'America/Sao_Paulo', dateStyle: 'short', timeStyle: 'short' });
  }
}
