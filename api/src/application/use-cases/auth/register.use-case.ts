import { IUserRepository } from '../../../domain/repositories/user.repository.interface';
import { IJwtService } from '../../../infrastructure/auth/jwt.service.interface';
import { IBcryptService } from '../../../infrastructure/auth/bcrypt.interface';
import { User } from '../../../domain/entities/user.entity';
import { ConflictException } from '../../../domain/exceptions/conflict.exception';
import { LoginOutput } from './login.use-case';

export interface RegisterInput {
  email: string;
  password: string;
}

export class RegisterUseCase {
  constructor(
    private readonly userRepo: IUserRepository,
    private readonly jwtService: IJwtService,
    private readonly bcrypt: IBcryptService,
  ) {}

  async execute(input: RegisterInput): Promise<LoginOutput> {
    const existing = await this.userRepo.findByEmail(input.email);
    if (existing) throw new ConflictException('E-mail já está em uso');

    const passwordHash = await this.bcrypt.hash(input.password);
    const user = User.create(input.email, passwordHash);
    await this.userRepo.save(user);

    const payload = { sub: user.id, email: user.email };
    return {
      accessToken: this.jwtService.sign(payload),
      refreshToken: this.jwtService.signRefresh(payload),
    };
  }
}
