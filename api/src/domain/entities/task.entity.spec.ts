import { Task } from './task.entity';

const USER_ID = 'user-1';

describe('Task entity', () => {
  it('create() produces a pending task', () => {
    const task = Task.create({ title: 'Comprar pão', userId: USER_ID });
    expect(task.id).toBeDefined();
    expect(task.title).toBe('Comprar pão');
    expect(task.description).toBeNull();
    expect(task.isDone).toBe(false);
    expect(task.userId).toBe(USER_ID);
  });

  it('create() accepts optional description', () => {
    const task = Task.create({ title: 'Estudar', userId: USER_ID, description: 'Cap. 3' });
    expect(task.description).toBe('Cap. 3');
  });

  it('create() throws when title is empty', () => {
    expect(() => Task.create({ title: '', userId: USER_ID })).toThrow();
  });

  it('complete() marks task as done', () => {
    const task = Task.create({ title: 'X', userId: USER_ID });
    task.complete();
    expect(task.isDone).toBe(true);
  });

  it('reopen() marks task as pending again', () => {
    const task = Task.create({ title: 'X', userId: USER_ID });
    task.complete();
    task.reopen();
    expect(task.isDone).toBe(false);
  });

  it('update() changes title and description', () => {
    const task = Task.create({ title: 'Original', userId: USER_ID });
    task.update('Novo título', 'nova desc');
    expect(task.title).toBe('Novo título');
    expect(task.description).toBe('nova desc');
  });

  it('isOwnedBy() returns true only for owner', () => {
    const task = Task.create({ title: 'X', userId: USER_ID });
    expect(task.isOwnedBy(USER_ID)).toBe(true);
    expect(task.isOwnedBy('outro')).toBe(false);
  });
});
