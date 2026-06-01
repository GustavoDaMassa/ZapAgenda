import { Body, Controller, HttpCode, HttpStatus, Post } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { LoginUseCase, LoginOutput } from '../../application/use-cases/auth/login.use-case';
import { RefreshUseCase, RefreshOutput } from '../../application/use-cases/auth/refresh.use-case';
import { LoginDto } from '../../application/dtos/auth/login.dto';
import { RefreshDto } from '../../application/dtos/auth/refresh.dto';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(
    private readonly loginUseCase: LoginUseCase,
    private readonly refreshUseCase: RefreshUseCase,
  ) {}

  @Post('login')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Autenticar usuário', description: 'Retorna accessToken (15min) e refreshToken (7d).' })
  @ApiResponse({
    status: 200,
    description: 'Login realizado com sucesso',
    schema: {
      example: {
        accessToken: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
        refreshToken: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
      },
    },
  })
  @ApiResponse({ status: 401, description: 'Credenciais inválidas' })
  login(@Body() dto: LoginDto): Promise<LoginOutput> {
    return this.loginUseCase.execute(dto);
  }

  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Renovar access token', description: 'Usa o refreshToken para emitir um novo par de tokens.' })
  @ApiResponse({
    status: 200,
    description: 'Tokens renovados',
    schema: {
      example: {
        accessToken: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
        refreshToken: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
      },
    },
  })
  @ApiResponse({ status: 401, description: 'Refresh token inválido ou expirado' })
  refresh(@Body() dto: RefreshDto): Promise<RefreshOutput> {
    return this.refreshUseCase.execute(dto.refreshToken);
  }
}
