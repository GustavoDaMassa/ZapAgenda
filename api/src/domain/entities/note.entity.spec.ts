import { Note } from './note.entity';

const USER_ID = 'user-1';

describe('Note entity', () => {
  it('create() produces an unpinned note', () => {
    const note = Note.create({ title: 'Reunião', content: 'Discutir orçamento', userId: USER_ID });
    expect(note.id).toBeDefined();
    expect(note.title).toBe('Reunião');
    expect(note.content).toBe('Discutir orçamento');
    expect(note.isPinned).toBe(false);
    expect(note.userId).toBe(USER_ID);
  });

  it('create() throws when title is empty', () => {
    expect(() => Note.create({ title: '', content: 'x', userId: USER_ID })).toThrow();
  });

  it('pin() sets isPinned to true', () => {
    const note = Note.create({ title: 'X', content: 'Y', userId: USER_ID });
    note.pin();
    expect(note.isPinned).toBe(true);
  });

  it('unpin() sets isPinned to false', () => {
    const note = Note.create({ title: 'X', content: 'Y', userId: USER_ID });
    note.pin();
    note.unpin();
    expect(note.isPinned).toBe(false);
  });

  it('update() changes title and content', () => {
    const note = Note.create({ title: 'Original', content: 'Antigo', userId: USER_ID });
    note.update('Novo título', 'Novo conteúdo');
    expect(note.title).toBe('Novo título');
    expect(note.content).toBe('Novo conteúdo');
  });

  it('isOwnedBy() returns true only for owner', () => {
    const note = Note.create({ title: 'X', content: 'Y', userId: USER_ID });
    expect(note.isOwnedBy(USER_ID)).toBe(true);
    expect(note.isOwnedBy('outro')).toBe(false);
  });
});
