import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsString, MinLength } from 'class-validator';

export class RegisterDto {
  @ApiProperty({ example: 'cliente@exemplo.com', description: 'E-mail do novo usuário (único no sistema)' })
  @IsEmail()
  email: string;

  @ApiProperty({ example: 'minhasenha123', description: 'Senha — mínimo 8 caracteres' })
  @IsString()
  @IsNotEmpty()
  @MinLength(8)
  password: string;
}
