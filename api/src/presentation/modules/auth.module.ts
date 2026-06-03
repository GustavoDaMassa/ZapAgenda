import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthController } from '../controllers/auth.controller';
import { LoginUseCase } from '../../application/use-cases/auth/login.use-case';
import { RefreshUseCase } from '../../application/use-cases/auth/refresh.use-case';
import { RegisterUseCase } from '../../application/use-cases/auth/register.use-case';
import { LinkWhatsappUseCase } from '../../application/use-cases/auth/link-whatsapp.use-case';
import { UserRepository } from '../../infrastructure/persistence/user.repository';
import { UserOrmEntity } from '../../infrastructure/persistence/user.orm-entity';
import { JwtServiceImpl } from '../../infrastructure/auth/jwt.service';
import { BcryptService } from '../../infrastructure/auth/bcrypt.service';
import { JwtStrategy } from '../../infrastructure/auth/jwt.strategy';
import { USER_REPOSITORY } from '../../domain/repositories/user.repository.interface';
import { JWT_SERVICE } from '../../infrastructure/auth/jwt.service.interface';
import { BCRYPT_SERVICE } from '../../infrastructure/auth/bcrypt.interface';

@Module({
  imports: [
    TypeOrmModule.forFeature([UserOrmEntity]),
    PassportModule,
    JwtModule.register({}),
  ],
  controllers: [AuthController],
  providers: [
    { provide: USER_REPOSITORY, useClass: UserRepository },
    { provide: JWT_SERVICE, useClass: JwtServiceImpl },
    { provide: BCRYPT_SERVICE, useClass: BcryptService },
    JwtStrategy,
    {
      provide: LoginUseCase,
      useFactory: (repo: UserRepository, jwt: JwtServiceImpl, bcrypt: BcryptService) =>
        new LoginUseCase(repo, jwt, bcrypt),
      inject: [USER_REPOSITORY, JWT_SERVICE, BCRYPT_SERVICE],
    },
    {
      provide: RefreshUseCase,
      useFactory: (repo: UserRepository, jwt: JwtServiceImpl) =>
        new RefreshUseCase(repo, jwt),
      inject: [USER_REPOSITORY, JWT_SERVICE],
    },
    {
      provide: RegisterUseCase,
      useFactory: (repo: UserRepository, jwt: JwtServiceImpl, bcrypt: BcryptService) =>
        new RegisterUseCase(repo, jwt, bcrypt),
      inject: [USER_REPOSITORY, JWT_SERVICE, BCRYPT_SERVICE],
    },
    {
      provide: LinkWhatsappUseCase,
      useFactory: (repo: UserRepository) => new LinkWhatsappUseCase(repo),
      inject: [USER_REPOSITORY],
    },
  ],
  exports: [JWT_SERVICE, BCRYPT_SERVICE, USER_REPOSITORY],
})
export class AuthModule {}
