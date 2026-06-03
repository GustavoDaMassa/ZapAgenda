import { IUserRepository } from '../../../domain/repositories/user.repository.interface';
import { ConflictException } from '../../../domain/exceptions/conflict.exception';
import { NotFoundException } from '../../../domain/exceptions/not-found.exception';

export class LinkWhatsappUseCase {
  constructor(private readonly userRepo: IUserRepository) {}

  async execute(userId: string, jid: string): Promise<void> {
    const user = await this.userRepo.findById(userId);
    if (!user) throw new NotFoundException('User', userId);

    const existing = await this.userRepo.findByWhatsappJid(jid);
    if (existing && existing.id !== userId) {
      throw new ConflictException('Este número de WhatsApp já está vinculado a outra conta');
    }

    user.linkWhatsapp(jid);
    await this.userRepo.save(user);
  }
}
