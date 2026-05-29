import { Injectable, Logger, OnApplicationBootstrap } from '@nestjs/common';
import { RabbitMQService } from './rabbitmq.service';
import { ReminderQueueMessage } from '../../domain/queue/reminder-queue.interface';

const READY_QUEUE = 'reminder.ready';

@Injectable()
export class ReminderConsumerService implements OnApplicationBootstrap {
  private readonly logger = new Logger(ReminderConsumerService.name);

  constructor(private readonly rabbitmq?: RabbitMQService) {}

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
    this.logger.log(`[TODO] Send WhatsApp reminder for appointment "${payload.appointmentTitle}" (${payload.reminderId})`);
  }
}
