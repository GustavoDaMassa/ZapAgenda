import { Appointment, CreatedVia, RecurrenceRule } from './appointment.entity';

describe('Appointment', () => {
  const baseProps = {
    title: 'Dentist',
    startTime: new Date('2026-06-01T15:00:00'),
    categoryId: 'cat-uuid',
  };

  it('should create appointment with correct defaults', () => {
    const appointment = Appointment.create(baseProps);

    expect(appointment.title).toBe('Dentist');
    expect(appointment.startTime).toEqual(baseProps.startTime);
    expect(appointment.isCancelled).toBe(false);
    expect(appointment.isRecurring).toBe(false);
    expect(appointment.recurrenceRule).toBeNull();
    expect(appointment.endTime).toBeNull();
    expect(appointment.description).toBeNull();
    expect(appointment.createdVia).toBe(CreatedVia.WHATSAPP);
  });

  it('should create appointment via dashboard', () => {
    const appointment = Appointment.create({
      ...baseProps,
      createdVia: CreatedVia.DASHBOARD,
    });

    expect(appointment.createdVia).toBe(CreatedVia.DASHBOARD);
  });

  it('should create recurring appointment', () => {
    const appointment = Appointment.create({
      ...baseProps,
      isRecurring: true,
      recurrenceRule: RecurrenceRule.WEEKLY,
    });

    expect(appointment.isRecurring).toBe(true);
    expect(appointment.recurrenceRule).toBe(RecurrenceRule.WEEKLY);
  });

  it('should cancel an appointment', () => {
    const appointment = Appointment.create(baseProps);
    appointment.cancel();

    expect(appointment.isCancelled).toBe(true);
  });
});
