import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';

describe('AuthController', () => {
  let controller: AuthController;
  let authService: jest.Mocked<AuthService>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        {
          provide: AuthService,
          useValue: {
            login: jest.fn(),
            refresh: jest.fn(),
          },
        },
      ],
    }).compile();

    controller = module.get(AuthController);
    authService = module.get(AuthService);
  });

  describe('login', () => {
    it('should return tokens from AuthService', async () => {
      const tokens = { accessToken: 'at', refreshToken: 'rt' };
      authService.login.mockResolvedValue(tokens);

      const result = await controller.login({
        email: 'test@example.com',
        password: 'password123',
      });

      expect(authService.login).toHaveBeenCalledWith(
        'test@example.com',
        'password123',
      );
      expect(result).toEqual(tokens);
    });
  });

  describe('refresh', () => {
    it('should return new tokens from AuthService', async () => {
      const tokens = { accessToken: 'new_at', refreshToken: 'new_rt' };
      authService.refresh.mockResolvedValue(tokens);

      const result = await controller.refresh({ refreshToken: 'rt' });

      expect(authService.refresh).toHaveBeenCalledWith('rt');
      expect(result).toEqual(tokens);
    });
  });
});
