import { Appointment } from './appointment.entity';

const base = {
  title: 'Dentista',
  startTime: new Date('2026-06-01T10:00:00Z'),
  categoryId: 'cat-1',
  createdVia: 'dashboard' as const,
};

describe('Appointment entity', () => {
  it('create() produces a valid Appointment', () => {
    const apt = Appointment.create(base);
    expect(apt.title).toBe('Dentista');
    expect(apt.isCancelled).toBe(false);
    expect(apt.isRecurring).toBe(false);
    expect(apt.id).toBeDefined();
    expect(apt.createdAt).toBeDefined();
  });

  it('create() throws when title is empty', () => {
    expect(() => Appointment.create({ ...base, title: '' })).toThrow();
  });

  it('create() throws when endTime is before startTime', () => {
    expect(() =>
      Appointment.create({
        ...base,
        endTime: new Date('2026-06-01T09:00:00Z'),
      }),
    ).toThrow();
  });

  it('create() accepts endTime after startTime', () => {
    const apt = Appointment.create({
      ...base,
      endTime: new Date('2026-06-01T11:00:00Z'),
    });
    expect(apt.endTime).toBeDefined();
  });

  it('create() throws when isRecurring without recurrenceRule', () => {
    expect(() =>
      Appointment.create({ ...base, isRecurring: true, recurrenceRule: undefined }),
    ).toThrow();
  });

  it('create() accepts isRecurring with recurrenceRule', () => {
    const apt = Appointment.create({ ...base, isRecurring: true, recurrenceRule: 'weekly' });
    expect(apt.isRecurring).toBe(true);
    expect(apt.recurrenceRule).toBe('weekly');
  });

  it('cancel() sets isCancelled to true', () => {
    const apt = Appointment.create(base);
    apt.cancel();
    expect(apt.isCancelled).toBe(true);
  });

  it('reschedule() updates startTime and endTime', () => {
    const apt = Appointment.create(base);
    const newStart = new Date('2026-06-02T14:00:00Z');
    const newEnd = new Date('2026-06-02T15:00:00Z');
    apt.reschedule(newStart, newEnd);
    expect(apt.startTime).toEqual(newStart);
    expect(apt.endTime).toEqual(newEnd);
  });

  it('reschedule() throws when new endTime is before new startTime', () => {
    const apt = Appointment.create(base);
    expect(() =>
      apt.reschedule(new Date('2026-06-02T14:00:00Z'), new Date('2026-06-02T13:00:00Z')),
    ).toThrow();
  });
});
