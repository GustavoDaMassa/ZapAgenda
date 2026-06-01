import { RegisterUseCase } from './register.use-case';
import { IUserRepository } from '../../../domain/repositories/user.repository.interface';
import { IJwtService } from '../../../infrastructure/auth/jwt.service.interface';
import { IBcryptService } from '../../../infrastructure/auth/bcrypt.interface';
import { ConflictException } from '../../../domain/exceptions/conflict.exception';
import { User } from '../../../domain/entities/user.entity';

const mockRepo = (): jest.Mocked<IUserRepository> => ({
  findByEmail: jest.fn(),
  findById: jest.fn(),
  findByWhatsappJid: jest.fn(),
  save: jest.fn(),
});

const mockJwt = (): jest.Mocked<IJwtService> => ({
  sign: jest.fn().mockReturnValue('access_token'),
  signRefresh: jest.fn().mockReturnValue('refresh_token'),
  verify: jest.fn(),
  verifyRefresh: jest.fn(),
});

const mockBcrypt: jest.Mocked<IBcryptService> = {
  hash: jest.fn().mockResolvedValue('hashed_password'),
  compare: jest.fn(),
};

describe('RegisterUseCase', () => {
  it('creates user and returns tokens', async () => {
    const repo = mockRepo();
    const jwt = mockJwt();
    repo.findByEmail.mockResolvedValue(null);

    const result = await new RegisterUseCase(repo, jwt, mockBcrypt).execute({
      email: 'novo@exemplo.com',
      password: 'minhasenha123',
    });

    expect(repo.save).toHaveBeenCalled();
    expect(mockBcrypt.hash).toHaveBeenCalledWith('minhasenha123');
    expect(result.accessToken).toBe('access_token');
    expect(result.refreshToken).toBe('refresh_token');
  });

  it('throws ConflictException when email already exists', async () => {
    const repo = mockRepo();
    const jwt = mockJwt();
    repo.findByEmail.mockResolvedValue(User.create('novo@exemplo.com', 'hash'));

    await expect(
      new RegisterUseCase(repo, jwt, mockBcrypt).execute({
        email: 'novo@exemplo.com',
        password: 'minhasenha123',
      }),
    ).rejects.toBeInstanceOf(ConflictException);
  });
});
