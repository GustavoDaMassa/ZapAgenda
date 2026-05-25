import { Injectable } from '@nestjs/common';
import { JwtService as NestJwtService, JwtSignOptions } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { IJwtService } from './jwt.service.interface';

@Injectable()
export class JwtServiceImpl implements IJwtService {
  constructor(
    private readonly nestJwt: NestJwtService,
    private readonly config: ConfigService,
  ) {}

  sign(payload: Record<string, unknown>): string {
    const options: JwtSignOptions = {
      secret: this.config.getOrThrow<string>('jwt.secret'),
      expiresIn: this.config.getOrThrow('jwt.expiresIn') as JwtSignOptions['expiresIn'],
    };
    return this.nestJwt.sign(payload, options);
  }

  signRefresh(payload: Record<string, unknown>): string {
    const options: JwtSignOptions = {
      secret: this.config.getOrThrow<string>('jwt.refreshSecret'),
      expiresIn: this.config.getOrThrow('jwt.refreshExpiresIn') as JwtSignOptions['expiresIn'],
    };
    return this.nestJwt.sign(payload, options);
  }

  verify(token: string): Record<string, unknown> {
    return this.nestJwt.verify(token, {
      secret: this.config.getOrThrow<string>('jwt.secret'),
    }) as Record<string, unknown>;
  }

  verifyRefresh(token: string): Record<string, unknown> {
    return this.nestJwt.verify(token, {
      secret: this.config.getOrThrow<string>('jwt.refreshSecret'),
    }) as Record<string, unknown>;
  }
}
