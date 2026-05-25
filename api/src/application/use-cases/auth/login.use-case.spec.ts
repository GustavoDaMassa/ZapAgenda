import { LoginUseCase } from './login.use-case';
import { IUserRepository } from '../../../domain/repositories/user.repository.interface';
import { IJwtService } from '../../../infrastructure/auth/jwt.service.interface';
import { User } from '../../../domain/entities/user.entity';
import { UnauthorizedException } from '../../../domain/exceptions/unauthorized.exception';

const makeUser = () => User.create('test@example.com', 'hashed');

const mockUserRepo = (): jest.Mocked<IUserRepository> => ({
  findByEmail: jest.fn(),
  findById: jest.fn(),
  save: jest.fn(),
});

const mockJwtService = (): jest.Mocked<IJwtService> => ({
  sign: jest.fn(),
  signRefresh: jest.fn(),
  verify: jest.fn(),
  verifyRefresh: jest.fn(),
});

const mockBcrypt = {
  compare: jest.fn(),
};

describe('LoginUseCase', () => {
  it('returns tokens when credentials are valid', async () => {
    const repo = mockUserRepo();
    const jwt = mockJwtService();
    repo.findByEmail.mockResolvedValue(makeUser());
    mockBcrypt.compare.mockResolvedValue(true);
    jwt.sign.mockReturnValue('access_token');
    jwt.signRefresh.mockReturnValue('refresh_token');

    const useCase = new LoginUseCase(repo, jwt, mockBcrypt as never);
    const result = await useCase.execute({ email: 'test@example.com', password: 'plain' });

    expect(result.accessToken).toBe('access_token');
    expect(result.refreshToken).toBe('refresh_token');
  });

  it('throws UnauthorizedException when user not found', async () => {
    const repo = mockUserRepo();
    const jwt = mockJwtService();
    repo.findByEmail.mockResolvedValue(null);

    const useCase = new LoginUseCase(repo, jwt, mockBcrypt as never);
    await expect(useCase.execute({ email: 'x@x.com', password: 'y' })).rejects.toBeInstanceOf(
      UnauthorizedException,
    );
  });

  it('throws UnauthorizedException when password is wrong', async () => {
    const repo = mockUserRepo();
    const jwt = mockJwtService();
    repo.findByEmail.mockResolvedValue(makeUser());
    mockBcrypt.compare.mockResolvedValue(false);

    const useCase = new LoginUseCase(repo, jwt, mockBcrypt as never);
    await expect(useCase.execute({ email: 'test@example.com', password: 'wrong' })).rejects.toBeInstanceOf(
      UnauthorizedException,
    );
  });
});
