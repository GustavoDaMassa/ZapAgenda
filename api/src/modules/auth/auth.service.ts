import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import * as bcrypt from 'bcrypt';
import { Repository } from 'typeorm';
import { UnauthorizedException } from '../../common/exceptions/unauthorized.exception';
import { User } from './entities/user.entity';

export interface TokenPair {
  accessToken: string;
  refreshToken: string;
}

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  async login(email: string, password: string): Promise<TokenPair> {
    const user = await this.userRepository.findOne({ where: { email } });
    if (!user) throw new UnauthorizedException();

    const valid = await bcrypt.compare(password, user.passwordHash);
    if (!valid) throw new UnauthorizedException();

    return this.generateTokens(user.id, user.email);
  }

  async refresh(refreshToken: string): Promise<TokenPair> {
    try {
      const payload = this.jwtService.verify(refreshToken, {
        secret: this.configService.get<string>('jwt.refreshSecret'),
      });
      return this.generateTokens(payload.sub, payload.email);
    } catch {
      throw new UnauthorizedException('Invalid or expired refresh token');
    }
  }

  private generateTokens(userId: string, email: string): TokenPair {
    const payload = { sub: userId, email };

    /* eslint-disable @typescript-eslint/no-explicit-any */
    const accessToken = this.jwtService.sign(payload, {
      secret: this.configService.get<string>('jwt.secret') as string,
      expiresIn: this.configService.get('jwt.expiresIn') as any,
    });

    const refreshToken = this.jwtService.sign(payload, {
      secret: this.configService.get<string>('jwt.refreshSecret') as string,
      expiresIn: this.configService.get('jwt.refreshExpiresIn') as any,
    });
    /* eslint-enable @typescript-eslint/no-explicit-any */

    return { accessToken, refreshToken };
  }
}
