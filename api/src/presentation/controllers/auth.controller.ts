import { Body, Controller, HttpCode, HttpStatus, Post } from '@nestjs/common';
import { LoginUseCase, LoginOutput } from '../../application/use-cases/auth/login.use-case';
import { RefreshUseCase, RefreshOutput } from '../../application/use-cases/auth/refresh.use-case';
import { LoginDto } from '../../application/dtos/auth/login.dto';
import { RefreshDto } from '../../application/dtos/auth/refresh.dto';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly loginUseCase: LoginUseCase,
    private readonly refreshUseCase: RefreshUseCase,
  ) {}

  @Post('login')
  @HttpCode(HttpStatus.OK)
  login(@Body() dto: LoginDto): Promise<LoginOutput> {
    return this.loginUseCase.execute(dto);
  }

  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  refresh(@Body() dto: RefreshDto): Promise<RefreshOutput> {
    return this.refreshUseCase.execute(dto.refreshToken);
  }
}
