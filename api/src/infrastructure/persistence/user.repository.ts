import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { IUserRepository } from '../../domain/repositories/user.repository.interface';
import { User } from '../../domain/entities/user.entity';
import { UserOrmEntity } from './user.orm-entity';

@Injectable()
export class UserRepository implements IUserRepository {
  constructor(
    @InjectRepository(UserOrmEntity)
    private readonly repo: Repository<UserOrmEntity>,
  ) {}

  async findByEmail(email: string): Promise<User | null> {
    const row = await this.repo.findOneBy({ email });
    return row ? this.toDomain(row) : null;
  }

  async findById(id: string): Promise<User | null> {
    const row = await this.repo.findOneBy({ id });
    return row ? this.toDomain(row) : null;
  }

  async findByWhatsappJid(jid: string): Promise<User | null> {
    const row = await this.repo.findOneBy({ whatsappJid: jid });
    return row ? this.toDomain(row) : null;
  }

  async save(user: User): Promise<void> {
    await this.repo.save({
      id: user.id,
      email: user.email,
      passwordHash: user.passwordHash,
      whatsappJid: user.whatsappJid,
    });
  }

  private toDomain(row: UserOrmEntity): User {
    return User.reconstitute(row.id, row.email, row.passwordHash, row.whatsappJid);
  }
}
