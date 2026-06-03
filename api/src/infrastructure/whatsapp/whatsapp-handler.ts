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
import { ListTasksUseCase } from '../../application/use-cases/task/list-tasks.use-case';
import { CreateTaskUseCase } from '../../application/use-cases/task/create-task.use-case';
import { UpdateTaskUseCase } from '../../application/use-cases/task/update-task.use-case';
import { ListNotesUseCase } from '../../application/use-cases/note/list-notes.use-case';
import { CreateNoteUseCase } from '../../application/use-cases/note/create-note.use-case';
import { Appointment } from '../../domain/entities/appointment.entity';
import { Task } from '../../domain/entities/task.entity';
import { Note } from '../../domain/entities/note.entity';

type Entities = Record<string, unknown>;

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
    private readonly listTasks: ListTasksUseCase,
    private readonly createTask: CreateTaskUseCase,
    private readonly updateTask: UpdateTaskUseCase,
    private readonly listNotes: ListNotesUseCase,
    private readonly createNote: CreateNoteUseCase,
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
      const isPendingConfirmation = !!session.pendingIntent && this.isConfirmation(text);

      if (isPendingConfirmation) {
        replyText = await this.executePending(user.id, session.pendingIntent!, session.pendingEntities);
        this.sessionStore.clearPending(jid);
      } else if (nlpResponse.needs_confirmation) {
        this.sessionStore.setPending(jid, nlpResponse.intent, nlpResponse.entities as Entities);
      } else {
        const result = await this.executeIntent(nlpResponse.intent, nlpResponse.entities as Entities, user.id);
        if (result !== null) replyText = result;
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
    return /^(sim|s|yes|confirmo|pode|ok|certo|claro)$/i.test(text.trim());
  }

  private async executePending(userId: string, intent: string, entities: Entities): Promise<string> {
    return (await this.executeIntent(intent, entities, userId)) ?? 'Pronto!';
  }

  private async executeIntent(intent: string, entities: Entities, userId: string): Promise<string | null> {
    switch (intent) {
      // --- Compromissos ---
      case 'create_appointment':  return this.handleCreateAppointment(entities, userId);
      case 'query_appointments':  return this.handleQueryAppointments(entities, userId);
      case 'cancel_appointment':  return this.handleCancelAppointment(entities, userId);
      case 'edit_appointment':
      case 'reschedule':          return this.handleReschedule(entities, userId);

      // --- Tarefas ---
      case 'create_task':   return this.handleCreateTask(entities, userId);
      case 'list_tasks':    return this.handleListTasks(userId);
      case 'complete_task': return this.handleCompleteTask(entities, userId);

      // --- Notas ---
      case 'create_note': return this.handleCreateNote(entities, userId);
      case 'list_notes':  return this.handleListNotes(userId);

      default: return null;
    }
  }

  // ── Compromissos ───────────────────────────────────────

  private async handleCreateAppointment(entities: Entities, userId: string): Promise<string> {
    const startTime = this.parseDateTime(entities.date as string, entities.time as string);
    if (!startTime) return 'Não consegui identificar a data e hora. Pode repetir?';

    const appointment = await this.createAppointment.execute({
      title: (entities.title as string) ?? 'Compromisso',
      startTime,
      categoryId: '',
      createdVia: 'whatsapp',
      userId,
    });

    return `Compromisso "${appointment.title}" marcado para ${this.fmt(appointment.startTime)}.`;
  }

  private async handleQueryAppointments(entities: Entities, userId: string): Promise<string> {
    const titleFilter = (entities.title as string | undefined)?.toLowerCase();
    const now = new Date();
    const end = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);

    const all = await this.listAppointments.execute({ start: now, end }, userId);
    const filtered = titleFilter
      ? all.filter((a: Appointment) => a.title.toLowerCase().includes(titleFilter))
      : all.filter((a: Appointment) => !a.isCancelled);

    if (filtered.length === 0) {
      return titleFilter
        ? `Não encontrei nenhum compromisso com "${entities.title}".`
        : 'Você não tem compromissos nos próximos 30 dias.';
    }

    if (titleFilter && filtered.length === 1) {
      const a = filtered[0];
      return `"${a.title}" está marcado para ${this.fmt(a.startTime)}.`;
    }

    const lines = filtered.slice(0, 5).map((a: Appointment) => `• ${a.title} — ${this.fmt(a.startTime)}`);
    return `Seus próximos compromissos:\n${lines.join('\n')}`;
  }

  private async handleCancelAppointment(entities: Entities, userId: string): Promise<string> {
    const title = (entities.title as string | undefined)?.toLowerCase();
    if (!title) return 'Qual compromisso você quer cancelar?';

    const all = await this.listAppointments.execute({}, userId);
    const match = all.find((a: Appointment) => a.title.toLowerCase().includes(title) && !a.isCancelled);
    if (!match) return `Não encontrei nenhum compromisso com "${entities.title}".`;

    await this.cancelAppointment.execute(match.id, userId);
    return `Compromisso "${match.title}" cancelado.`;
  }

  private async handleReschedule(entities: Entities, userId: string): Promise<string> {
    const title = (entities.title as string | undefined)?.toLowerCase();
    if (!title) return 'Qual compromisso você quer remarcar?';

    const newDate = (entities.new_date ?? entities.date) as string;
    const newTime = (entities.new_time ?? entities.time) as string;
    const startTime = this.parseDateTime(newDate, newTime);
    if (!startTime) return 'Não consegui identificar a nova data e hora.';

    const all = await this.listAppointments.execute({}, userId);
    const match = all.find((a: Appointment) => a.title.toLowerCase().includes(title) && !a.isCancelled);
    if (!match) return `Não encontrei nenhum compromisso com "${entities.title}".`;

    await this.updateAppointment.execute(match.id, {
      title: match.title,
      startTime,
      categoryId: match.categoryId,
    }, userId);

    return `"${match.title}" remarcado para ${this.fmt(startTime)}.`;
  }

  // ── Tarefas ────────────────────────────────────────────

  private async handleCreateTask(entities: Entities, userId: string): Promise<string> {
    const title = entities.title as string;
    if (!title) return 'Qual o nome da tarefa?';

    await this.createTask.execute({
      title,
      description: entities.description as string | undefined,
      userId,
    });

    return `Tarefa "${title}" adicionada à sua lista.`;
  }

  private async handleListTasks(userId: string): Promise<string> {
    const tasks = await this.listTasks.execute(userId);
    const pending = tasks.filter((t: Task) => !t.isDone);
    const done = tasks.filter((t: Task) => t.isDone);

    if (tasks.length === 0) return 'Sua lista de tarefas está vazia.';

    const lines: string[] = [];
    if (pending.length > 0) {
      lines.push('*Pendentes:*');
      pending.slice(0, 5).forEach((t: Task) => lines.push(`○ ${t.title}`));
    }
    if (done.length > 0) {
      lines.push('*Concluídas:*');
      done.slice(0, 3).forEach((t: Task) => lines.push(`✓ ${t.title}`));
    }

    return lines.join('\n');
  }

  private async handleCompleteTask(entities: Entities, userId: string): Promise<string> {
    const title = (entities.title as string | undefined)?.toLowerCase();
    if (!title) return 'Qual tarefa você quer marcar como concluída?';

    const tasks = await this.listTasks.execute(userId);
    const match = tasks.find((t: Task) => t.title.toLowerCase().includes(title) && !t.isDone);
    if (!match) return `Não encontrei a tarefa "${entities.title}" na sua lista.`;

    await this.updateTask.execute(match.id, { isDone: true }, userId);
    return `Tarefa "${match.title}" marcada como concluída! ✓`;
  }

  // ── Notas ──────────────────────────────────────────────

  private async handleCreateNote(entities: Entities, userId: string): Promise<string> {
    const title = entities.title as string;
    const content = (entities.content as string) ?? '';
    if (!title) return 'Qual o título da nota?';

    await this.createNote.execute({ title, content, userId });
    return `Nota "${title}" salva no seu bloco.`;
  }

  private async handleListNotes(userId: string): Promise<string> {
    const notes = await this.listNotes.execute(userId);
    if (notes.length === 0) return 'Seu bloco de notas está vazio.';

    const pinned = notes.filter((n: Note) => n.isPinned);
    const rest = notes.filter((n: Note) => !n.isPinned);

    const lines: string[] = [];
    if (pinned.length > 0) {
      lines.push('*📌 Fixadas:*');
      pinned.forEach((n: Note) => lines.push(`• ${n.title}: ${n.content.slice(0, 60)}${n.content.length > 60 ? '…' : ''}`));
    }
    if (rest.length > 0) {
      lines.push('*Notas:*');
      rest.slice(0, 5).forEach((n: Note) => lines.push(`• ${n.title}`));
    }

    return lines.join('\n');
  }

  // ── Utilitários ────────────────────────────────────────

  private parseDateTime(date: string | undefined, time: string | undefined): Date | null {
    if (!date) return null;
    const [h, m] = (time ?? '09:00').split(':').map(Number);
    const d = new Date(`${date}T${String(h).padStart(2, '0')}:${String(m ?? 0).padStart(2, '0')}:00-03:00`);
    return isNaN(d.getTime()) ? null : d;
  }

  private fmt(date: Date): string {
    return date.toLocaleString('pt-BR', {
      timeZone: 'America/Sao_Paulo',
      dateStyle: 'short',
      timeStyle: 'short',
    });
  }
}
