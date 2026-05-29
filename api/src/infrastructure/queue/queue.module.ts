import { Module } from '@nestjs/common';
import { RabbitMQService } from './rabbitmq.service';
import { ReminderProducerService } from './reminder-producer.service';
import { ReminderConsumerService } from './reminder-consumer.service';
import { REMINDER_QUEUE } from '../../domain/queue/reminder-queue.interface';

@Module({
  providers: [
    RabbitMQService,
    { provide: REMINDER_QUEUE, useClass: ReminderProducerService },
    {
      provide: ReminderProducerService,
      useFactory: (rabbitmq: RabbitMQService) => new ReminderProducerService(rabbitmq),
      inject: [RabbitMQService],
    },
    {
      provide: ReminderConsumerService,
      useFactory: (rabbitmq: RabbitMQService) => new ReminderConsumerService(rabbitmq),
      inject: [RabbitMQService],
    },
  ],
  exports: [REMINDER_QUEUE],
})
export class QueueModule {}
