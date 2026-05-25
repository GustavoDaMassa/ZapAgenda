import { Injectable } from '@nestjs/common';
import * as bcrypt from 'bcryptjs';
import { IBcryptService } from './bcrypt.interface';

@Injectable()
export class BcryptService implements IBcryptService {
  async hash(plain: string, rounds = 10): Promise<string> {
    return bcrypt.hash(plain, rounds);
  }

  async compare(plain: string, hash: string): Promise<boolean> {
    return bcrypt.compare(plain, hash);
  }
}
