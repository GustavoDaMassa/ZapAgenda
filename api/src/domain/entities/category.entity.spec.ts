import { Category } from './category.entity';

const USER_ID = 'user-1';

describe('Category entity', () => {
  it('create() produces a user-owned Category', () => {
    const cat = Category.create('Saúde', '#FF0000', USER_ID);
    expect(cat.name).toBe('Saúde');
    expect(cat.color).toBe('#FF0000');
    expect(cat.defaultReminderMinutes).toBeNull();
    expect(cat.isSystem).toBe(false);
    expect(cat.userId).toBe(USER_ID);
    expect(cat.id).toBeDefined();
  });

  it('create() accepts optional defaultReminderMinutes', () => {
    const cat = Category.create('Trabalho', '#0000FF', USER_ID, 30);
    expect(cat.defaultReminderMinutes).toBe(30);
  });

  it('create() throws when name is empty', () => {
    expect(() => Category.create('', '#FF0000', USER_ID)).toThrow();
  });

  it('create() throws when color is not a valid hex', () => {
    expect(() => Category.create('Saúde', 'red', USER_ID)).toThrow();
  });

  it('createSystem() has userId null and isSystem true', () => {
    const cat = Category.createSystem('Pessoal', '#AABBCC');
    expect(cat.isSystem).toBe(true);
    expect(cat.userId).toBeNull();
  });

  it('isSystem category isDeletable returns false', () => {
    expect(Category.createSystem('X', '#112233').isDeletable()).toBe(false);
  });

  it('user-owned category isDeletable returns true', () => {
    expect(Category.create('X', '#112233', USER_ID).isDeletable()).toBe(true);
  });

  it('isOwnedBy() returns true for the owner', () => {
    const cat = Category.create('X', '#112233', USER_ID);
    expect(cat.isOwnedBy(USER_ID)).toBe(true);
    expect(cat.isOwnedBy('other')).toBe(false);
  });
});
