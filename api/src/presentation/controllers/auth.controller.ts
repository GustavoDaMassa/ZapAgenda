import { Body, Controller, HttpCode, HttpStatus, Post } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { LoginUseCase, LoginOutput } from '../../application/use-cases/auth/login.use-case';
import { RefreshUseCase, RefreshOutput } from '../../application/use-cases/auth/refresh.use-case';
import { RegisterUseCase } from '../../application/use-cases/auth/register.use-case';
import { LoginDto } from '../../application/dtos/auth/login.dto';
import { RefreshDto } from '../../application/dtos/auth/refresh.dto';
import { RegisterDto } from '../../application/dtos/auth/register.dto';

const TOKEN_EXAMPLE = {
  accessToken: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
  refreshToken: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
};

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(
    private readonly loginUseCase: LoginUseCase,
    private readonly refreshUseCase: RefreshUseCase,
    private readonly registerUseCase: RegisterUseCase,
  ) {}

  @Post('register')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: 'Cadastrar novo usuário',
    description: 'Cria uma conta com email e senha. Retorna os tokens de acesso imediatamente — não é necessário fazer login separado.',
  })
  @ApiResponse({ status: 201, description: 'Usuário criado e autenticado', schema: { example: TOKEN_EXAMPLE } })
  @ApiResponse({ status: 400, description: 'Dados inválidos (senha menor que 8 caracteres, email inválido)' })
  @ApiResponse({ status: 409, description: 'E-mail já cadastrado' })
  register(@Body() dto: RegisterDto): Promise<LoginOutput> {
    return this.registerUseCase.execute(dto);
  }

  @Post('login')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Autenticar usuário', description: 'Retorna accessToken (15min) e refreshToken (7d).' })
  @ApiResponse({ status: 200, description: 'Login realizado com sucesso', schema: { example: TOKEN_EXAMPLE } })
  @ApiResponse({ status: 401, description: 'Credenciais inválidas' })
  login(@Body() dto: LoginDto): Promise<LoginOutput> {
    return this.loginUseCase.execute(dto);
  }

  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Renovar access token', description: 'Usa o refreshToken para emitir um novo par de tokens.' })
  @ApiResponse({ status: 200, description: 'Tokens renovados', schema: { example: TOKEN_EXAMPLE } })
  @ApiResponse({ status: 401, description: 'Refresh token inválido ou expirado' })
  refresh(@Body() dto: RefreshDto): Promise<RefreshOutput> {
    return this.refreshUseCase.execute(dto.refreshToken);
  }
}
