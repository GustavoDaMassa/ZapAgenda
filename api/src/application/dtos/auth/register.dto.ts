import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsOptional, IsString, Matches, MinLength } from 'class-validator';

export class RegisterDto {
  @ApiProperty({ example: 'cliente@exemplo.com', description: 'E-mail do novo usuário (único no sistema)' })
  @IsEmail()
  email: string;

  @ApiProperty({ example: 'minhasenha123', description: 'Senha — mínimo 8 caracteres' })
  @IsString()
  @IsNotEmpty()
  @MinLength(8)
  password: string;

  @ApiPropertyOptional({
    example: '5511999999999@s.whatsapp.net',
    description: 'JID do WhatsApp para ativar o bot (formato: DDDDnúmero@s.whatsapp.net). Pode ser vinculado depois via PATCH /auth/link-whatsapp.',
  })
  @IsOptional()
  @IsString()
  @Matches(/^\d+@s\.whatsapp\.net$/, { message: 'whatsappJid deve estar no formato 5511999999999@s.whatsapp.net' })
  whatsappJid?: string;
}
