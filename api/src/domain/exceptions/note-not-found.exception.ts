import { NotFoundException } from './not-found.exception';
export class NoteNotFoundException extends NotFoundException {
  constructor(id: string) { super('Note', id); }
}
