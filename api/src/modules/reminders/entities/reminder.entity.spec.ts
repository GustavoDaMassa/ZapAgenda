import { Reminder, ReminderStatus } from './reminder.entity';

describe('Reminder', () => {
  const baseProps = {
    appointmentId: 'apt-uuid',
    minutesBefore: 30,
    scheduledFor: new Date('2026-06-01T14:30:00'),
  };

  it('should create reminder with correct defaults', () => {
    const reminder = Reminder.create(baseProps);

    expect(reminder.appointmentId).toBe('apt-uuid');
    expect(reminder.minutesBefore).toBe(30);
    expect(reminder.status).toBe(ReminderStatus.PENDING);
    expect(reminder.sentAt).toBeNull();
  });

  it('should mark reminder as sent', () => {
    const reminder = Reminder.create(baseProps);
    reminder.markAsSent();

    expect(reminder.status).toBe(ReminderStatus.SENT);
    expect(reminder.sentAt).toBeInstanceOf(Date);
  });

  it('should mark reminder as failed', () => {
    const reminder = Reminder.create(baseProps);
    reminder.markAsFailed();

    expect(reminder.status).toBe(ReminderStatus.FAILED);
  });
});
