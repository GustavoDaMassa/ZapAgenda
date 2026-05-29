import { ReminderProducerService } from './reminder-producer.service';
import { RabbitMQService } from './rabbitmq.service';
import { ReminderQueueMessage } from '../../domain/queue/reminder-queue.interface';

const makeMessage = (): ReminderQueueMessage => ({
  reminderId: 'rem-1',
  appointmentId: 'appt-1',
  appointmentTitle: 'Dentista',
  scheduledFor: new Date(Date.now() + 60_000).toISOString(),
});

describe('ReminderProducerService', () => {
  const mockChannel = {
    sendToQueue: jest.fn().mockReturnValue(true),
  };

  const mockRabbitMQ = {
    getChannel: jest.fn().mockReturnValue(mockChannel),
  } as unknown as RabbitMQService;

  beforeEach(() => jest.clearAllMocks());

  it('publishes message to delay queue with TTL expiration', async () => {
    const producer = new ReminderProducerService(mockRabbitMQ);
    const msg = makeMessage();
    await producer.schedule(msg, 60_000);

    expect(mockChannel.sendToQueue).toHaveBeenCalledWith(
      'reminder.delay',
      expect.any(Buffer),
      expect.objectContaining({ expiration: '60000', persistent: true }),
    );
  });

  it('encodes the full message payload in the buffer', async () => {
    const producer = new ReminderProducerService(mockRabbitMQ);
    const msg = makeMessage();
    await producer.schedule(msg, 30_000);

    const [, buffer] = mockChannel.sendToQueue.mock.calls[0] as [string, Buffer, object];
    const decoded = JSON.parse(buffer.toString());
    expect(decoded.reminderId).toBe('rem-1');
    expect(decoded.appointmentTitle).toBe('Dentista');
  });
});
