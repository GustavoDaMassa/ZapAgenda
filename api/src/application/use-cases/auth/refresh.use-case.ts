import { IJwtService } from '../../../infrastructure/auth/jwt.service.interface';
import { IUserRepository } from '../../../domain/repositories/user.repository.interface';
import { UnauthorizedException } from '../../../domain/exceptions/unauthorized.exception';

export interface RefreshOutput {
  accessToken: string;
  refreshToken: string;
}

export class RefreshUseCase {
  constructor(
    private readonly userRepo: IUserRepository,
    private readonly jwtService: IJwtService,
  ) {}

  async execute(refreshToken: string): Promise<RefreshOutput> {
    let payload: Record<string, unknown>;
    try {
      payload = this.jwtService.verifyRefresh(refreshToken);
    } catch {
      throw new UnauthorizedException('Invalid refresh token');
    }

    const user = await this.userRepo.findById(payload['sub'] as string);
    if (!user) throw new UnauthorizedException('User not found');

    const newPayload = { sub: user.id, email: user.email };
    return {
      accessToken: this.jwtService.sign(newPayload),
      refreshToken: this.jwtService.signRefresh(newPayload),
    };
  }
}
