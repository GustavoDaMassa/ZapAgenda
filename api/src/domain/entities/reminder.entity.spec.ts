import { Reminder } from './reminder.entity';

const futureDate = () => new Date(Date.now() + 60 * 60 * 1000);

describe('Reminder entity', () => {
  it('create() produces a valid Reminder', () => {
    const scheduledFor = futureDate();
    const r = Reminder.create({ appointmentId: 'appt-1', minutesBefore: 30, scheduledFor });
    expect(r.id).toBeDefined();
    expect(r.appointmentId).toBe('appt-1');
    expect(r.minutesBefore).toBe(30);
    expect(r.status).toBe('pending');
    expect(r.scheduledFor).toBe(scheduledFor);
    expect(r.sentAt).toBeNull();
  });

  it('create() throws when minutesBefore is not positive', () => {
    expect(() => Reminder.create({ appointmentId: 'x', minutesBefore: 0, scheduledFor: futureDate() })).toThrow();
    expect(() => Reminder.create({ appointmentId: 'x', minutesBefore: -5, scheduledFor: futureDate() })).toThrow();
  });

  it('markAsSent() sets status to sent and records sentAt', () => {
    const r = Reminder.create({ appointmentId: 'x', minutesBefore: 30, scheduledFor: futureDate() });
    r.markAsSent();
    expect(r.status).toBe('sent');
    expect(r.sentAt).toBeInstanceOf(Date);
  });

  it('markAsFailed() sets status to failed', () => {
    const r = Reminder.create({ appointmentId: 'x', minutesBefore: 30, scheduledFor: futureDate() });
    r.markAsFailed();
    expect(r.status).toBe('failed');
  });

  it('reconstitute() rebuilds a Reminder without validation', () => {
    const sentAt = new Date();
    const r = Reminder.reconstitute('id-1', 'appt-1', 15, 'sent', new Date(), sentAt);
    expect(r.id).toBe('id-1');
    expect(r.status).toBe('sent');
    expect(r.sentAt).toBe(sentAt);
  });
});
