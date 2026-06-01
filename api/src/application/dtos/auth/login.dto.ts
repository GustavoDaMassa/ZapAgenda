import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsString } from 'class-validator';

export class LoginDto {
  @ApiProperty({ example: 'admin@zapagenda.com', description: 'E-mail do usuário' })
  @IsEmail()
  email: string;

  @ApiProperty({ example: 'password', description: 'Senha do usuário' })
  @IsString()
  @IsNotEmpty()
  password: string;
}
