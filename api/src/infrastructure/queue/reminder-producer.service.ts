import { Injectable } from '@nestjs/common';
import { IReminderQueue, ReminderQueueMessage } from '../../domain/queue/reminder-queue.interface';
import { RabbitMQService } from './rabbitmq.service';

const DELAY_QUEUE = 'reminder.delay';

@Injectable()
export class ReminderProducerService implements IReminderQueue {
  constructor(private readonly rabbitmq: RabbitMQService) {}

  async schedule(message: ReminderQueueMessage, delayMs: number): Promise<void> {
    const channel = this.rabbitmq.getChannel();
    channel.sendToQueue(
      DELAY_QUEUE,
      Buffer.from(JSON.stringify(message)),
      { expiration: String(delayMs), persistent: true },
    );
  }
}
