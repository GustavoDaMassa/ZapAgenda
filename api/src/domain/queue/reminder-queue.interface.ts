export interface ReminderQueueMessage {
  reminderId: string;
  appointmentId: string;
  appointmentTitle: string;
  scheduledFor: string;
}

export interface IReminderQueue {
  schedule(message: ReminderQueueMessage, delayMs: number): Promise<void>;
}

export const REMINDER_QUEUE = Symbol('IReminderQueue');
