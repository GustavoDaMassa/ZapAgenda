import { User } from './user.entity';

describe('User entity', () => {
  it('create() produces a valid User', () => {
    const user = User.create('test@example.com', 'hashed_pw');
    expect(user.email).toBe('test@example.com');
    expect(user.passwordHash).toBe('hashed_pw');
    expect(user.id).toBeDefined();
    expect(user.whatsappJid).toBeNull();
  });

  it('create() accepts optional whatsappJid', () => {
    const user = User.create('test@example.com', 'hashed_pw', '5511999999999@s.whatsapp.net');
    expect(user.whatsappJid).toBe('5511999999999@s.whatsapp.net');
  });

  it('create() throws when email is empty', () => {
    expect(() => User.create('', 'hash')).toThrow();
  });

  it('create() throws when passwordHash is empty', () => {
    expect(() => User.create('a@b.com', '')).toThrow();
  });

  it('linkWhatsapp() sets whatsappJid', () => {
    const user = User.create('test@example.com', 'hash');
    user.linkWhatsapp('5511999999999@s.whatsapp.net');
    expect(user.whatsappJid).toBe('5511999999999@s.whatsapp.net');
  });
});
