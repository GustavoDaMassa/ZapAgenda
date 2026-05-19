import { Category } from './category.entity';

describe('Category', () => {
  it('should create a category with correct properties', () => {
    const category = Category.create({ name: 'Work', color: '#FF5733' });

    expect(category.name).toBe('Work');
    expect(category.color).toBe('#FF5733');
    expect(category.isSystem).toBe(false);
    expect(category.defaultReminderMinutes).toBeNull();
  });

  it('should create a system category', () => {
    const category = Category.create({
      name: 'Health',
      color: '#00FF00',
      isSystem: true,
    });

    expect(category.isSystem).toBe(true);
  });

  it('should create a category with default reminder minutes', () => {
    const category = Category.create({
      name: 'Meetings',
      color: '#0000FF',
      defaultReminderMinutes: 30,
    });

    expect(category.defaultReminderMinutes).toBe(30);
  });
});
