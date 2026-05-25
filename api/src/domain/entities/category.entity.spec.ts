import { Category } from './category.entity';

describe('Category entity', () => {
  it('create() produces a valid Category', () => {
    const cat = Category.create('Saúde', '#FF0000');
    expect(cat.name).toBe('Saúde');
    expect(cat.color).toBe('#FF0000');
    expect(cat.defaultReminderMinutes).toBeNull();
    expect(cat.isSystem).toBe(false);
    expect(cat.id).toBeDefined();
  });

  it('create() accepts optional defaultReminderMinutes', () => {
    const cat = Category.create('Trabalho', '#0000FF', 30);
    expect(cat.defaultReminderMinutes).toBe(30);
  });

  it('create() throws when name is empty', () => {
    expect(() => Category.create('', '#FF0000')).toThrow();
  });

  it('create() throws when color is not a valid hex', () => {
    expect(() => Category.create('Saúde', 'red')).toThrow();
    expect(() => Category.create('Saúde', '#ZZZZZZ')).toThrow();
  });

  it('createSystem() marks category as system', () => {
    const cat = Category.createSystem('Pessoal', '#AABBCC');
    expect(cat.isSystem).toBe(true);
  });

  it('isSystem category cannot be updated — isDeletable returns false', () => {
    const cat = Category.createSystem('Pessoal', '#AABBCC');
    expect(cat.isDeletable()).toBe(false);
  });

  it('non-system category isDeletable returns true', () => {
    const cat = Category.create('Custom', '#112233');
    expect(cat.isDeletable()).toBe(true);
  });
});
