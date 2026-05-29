import { ReminderConsumerService } from './reminder-consumer.service';
import { ReminderQueueMessage } from '../../domain/queue/reminder-queue.interface';

describe('ReminderConsumerService', () => {
  it('handleMessage extracts payload and calls sendReminder', async () => {
    const consumer = new ReminderConsumerService();
    const msg: ReminderQueueMessage = {
      reminderId: 'rem-1',
      appointmentId: 'appt-1',
      appointmentTitle: 'Dentista',
      scheduledFor: new Date().toISOString(),
    };

    const spy = jest.spyOn(consumer, 'sendReminder' as keyof ReminderConsumerService);

    await consumer.handleMessage(Buffer.from(JSON.stringify(msg)));

    expect(spy).toHaveBeenCalledWith(msg);
  });

  it('handleMessage ignores null messages gracefully', async () => {
    const consumer = new ReminderConsumerService();
    await expect(consumer.handleMessage(null)).resolves.toBeUndefined();
  });
});
