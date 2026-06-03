import { ApiProperty } from '@nestjs/swagger';
import { IsString, Matches } from 'class-validator';

export class LinkWhatsappDto {
  @ApiProperty({
    example: '5511999999999@s.whatsapp.net',
    description: 'JID do WhatsApp no formato DDDDnúmero@s.whatsapp.net',
  })
  @IsString()
  @Matches(/^\d+@s\.whatsapp\.net$/, { message: 'Formato inválido. Use: 5511999999999@s.whatsapp.net' })
  whatsappJid: string;
}
