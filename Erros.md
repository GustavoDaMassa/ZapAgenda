# ZapZap — Erros e Correções

Registro de bugs identificados e corrigidos durante o desenvolvimento.

Formato:
**data · fase · título curto**
- Erro: descrição do sintoma
- Causa: causa raiz identificada
- Correção: o que foi feito para resolver

---

**2026-05-19 · Fase 4 · import path errado no auth.service.spec.ts**
- Erro: `Cannot find module '../../../common/exceptions/unauthorized.exception'`
- Causa: `../../..` a partir de `src/modules/auth/` ultrapassa o diretório `src/` — o caminho correto é `../../`
- Correção: substituído `../../../common/` por `../../common/` no spec

**2026-05-19 · Fase 4 · JwtAuthGuard não importado em auth.module.ts**
- Erro: `TS2304: Cannot find name 'JwtAuthGuard'`
- Causa: guard criado em `guards/jwt-auth.guard.ts` mas não importado no módulo
- Correção: adicionado `import { JwtAuthGuard } from './guards/jwt-auth.guard'`

**2026-05-19 · Fase 4 · expiresIn incompatível com StringValue em @nestjs/jwt v11**
- Erro: `Type 'string' is not assignable to type 'number | StringValue | undefined'`
- Causa: `@nestjs/jwt` v11 tipa `expiresIn` como `StringValue` (branded type do pacote `ms`), não como `string` genérico
- Correção: cast para `any` nos pontos de atribuição em `auth.service.ts` e `auth.module.ts`

**2026-05-19 · Fase 4 · jest.spyOn não funciona com import * as bcrypt**
- Erro: `jest.spyOn` lança erro ao tentar espionar `bcrypt.compare`
- Causa: `bcrypt` é um módulo CommonJS com propriedades não-configuráveis — `spyOn` não consegue substituí-las
- Correção: substituído por `jest.mock('bcrypt')` no topo do arquivo + cast `(bcrypt.compare as jest.Mock).mockResolvedValue(...)`

---

**2026-05-19 · Fase 7 · GlobalExceptionFilter retornava 500 para exceções nativas do NestJS**
- Erro: `POST /auth/login` com payload inválido retornava 500; `GET /categories` sem token retornava 500
- Causa: `BadRequestException` (ValidationPipe) e `UnauthorizedException` (JWT guard) estendem `HttpException` do NestJS, não `AppException` — o filter só tratava `AppException` e jogava tudo mais para o bloco 500
- Correção: adicionado branch `else if (exception instanceof HttpException)` no filter para tratar exceções nativas com seus status e mensagens originais

---
