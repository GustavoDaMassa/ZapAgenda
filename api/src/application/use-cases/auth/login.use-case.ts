import { IUserRepository } from '../../../domain/repositories/user.repository.interface';
import { IJwtService } from '../../../infrastructure/auth/jwt.service.interface';
import { IBcryptService } from '../../../infrastructure/auth/bcrypt.interface';
import { UnauthorizedException } from '../../../domain/exceptions/unauthorized.exception';

export interface LoginInput {
  email: string;
  password: string;
}

export interface LoginOutput {
  accessToken: string;
  refreshToken: string;
}

export class LoginUseCase {
  constructor(
    private readonly userRepo: IUserRepository,
    private readonly jwtService: IJwtService,
    private readonly bcrypt: IBcryptService,
  ) {}

  async execute(input: LoginInput): Promise<LoginOutput> {
    const user = await this.userRepo.findByEmail(input.email);
    if (!user) throw new UnauthorizedException('Invalid credentials');

    const valid = await this.bcrypt.compare(input.password, user.passwordHash);
    if (!valid) throw new UnauthorizedException('Invalid credentials');

    const payload = { sub: user.id, email: user.email };
    return {
      accessToken: this.jwtService.sign(payload),
      refreshToken: this.jwtService.signRefresh(payload),
    };
  }
}
