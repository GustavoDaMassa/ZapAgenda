import { User } from './user.entity';

describe('User entity', () => {
  it('create() produces a valid User with hashed password slot', () => {
    const user = User.create('test@example.com', 'hashed_pw');
    expect(user.email).toBe('test@example.com');
    expect(user.passwordHash).toBe('hashed_pw');
    expect(user.id).toBeDefined();
  });

  it('create() throws when email is empty', () => {
    expect(() => User.create('', 'hash')).toThrow();
  });

  it('create() throws when passwordHash is empty', () => {
    expect(() => User.create('a@b.com', '')).toThrow();
  });
});
