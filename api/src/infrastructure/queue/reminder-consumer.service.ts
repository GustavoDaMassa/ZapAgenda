import { Injectable, Logger, OnApplicationBootstrap } from '@nestjs/common';
import { RabbitMQService } from './rabbitmq.service';
import { ReminderQueueMessage } from '../../domain/queue/reminder-queue.interface';
import type { IUserRepository } from '../../domain/repositories/user.repository.interface';
import type { IAppointmentRepository } from '../../domain/repositories/appointment.repository.interface';

const READY_QUEUE = 'reminder.ready';

@Injectable()
export class ReminderConsumerService implements OnApplicationBootstrap {
  private readonly logger = new Logger(ReminderConsumerService.name);
  private sendText: ((jid: string, text: string) => Promise<void>) | null = null;
  private userRepo: IUserRepository | null = null;
  private appointmentRepo: IAppointmentRepository | null = null;

  constructor(private readonly rabbitmq?: RabbitMQService) {}

  setDependencies(
    userRepo: IUserRepository,
    appointmentRepo: IAppointmentRepository,
    sendText: (jid: string, text: string) => Promise<void>,
  ): void {
    this.userRepo = userRepo;
    this.appointmentRepo = appointmentRepo;
    this.sendText = sendText;
  }

  async onApplicationBootstrap(): Promise<void> {
    if (!this.rabbitmq) return;
    try {
      const channel = this.rabbitmq.getChannel();
      await channel.consume(READY_QUEUE, async (msg) => {
        await this.handleMessage(msg?.content ?? null);
        if (msg) channel.ack(msg);
      });
    } catch (err) {
      this.logger.error('Failed to start reminder consumer', err);
    }
  }

  async handleMessage(content: Buffer | null): Promise<void> {
    if (!content) return;
    const payload: ReminderQueueMessage = JSON.parse(content.toString());
    await this.sendReminder(payload);
  }

  protected async sendReminder(payload: ReminderQueueMessage): Promise<void> {
    const appointment = await this.appointmentRepo?.findById(payload.appointmentId);
    if (!appointment) {
      this.logger.warn(`Reminder skipped — appointment ${payload.appointmentId} not found`);
      return;
    }

    const user = await this.userRepo?.findById(appointment.userId);
    if (!user?.whatsappJid) {
      this.logger.warn(`Reminder skipped — user ${appointment.userId} has no whatsappJid`);
      return;
    }

    const msg = `Lembrete: "${payload.appointmentTitle}" está chegando!`;
    if (this.sendText) {
      await this.sendText(user.whatsappJid, msg);
    } else {
      this.logger.log(`[STUB] Reminder for ${user.whatsappJid}: ${msg}`);
    }
  }
}
