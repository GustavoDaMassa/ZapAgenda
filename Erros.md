# Erros — ZapAgenda

Registro de bugs identificados e corrigidos durante o desenvolvimento.

---

**2026-05-25 · Fase 5 · Type alias em decorator com `emitDecoratorMetadata`**
- Erro: `TS1272: A type referenced in a decorated signature must be imported with 'import type'` — `CreatedVia` e `RecurrenceRule` usados como valor em `@IsEnum`
- Causa: `type` aliases não existem em runtime; `emitDecoratorMetadata` exige que tipos em assinaturas decoradas sejam importados com `import type`
- Correção: usar `import type` para os aliases e definir const arrays `['whatsapp', 'dashboard']` como argumento do `@IsEnum`

---

**2026-05-24 · Fase 4 · `expiresIn` e `secretOrKey` com tipo incompatível no NestJS JWT**
- Erro: `Type 'string' is not assignable to type 'number | StringValue | undefined'` em `jwt.service.ts`; `Type 'string | undefined'` em `jwt.strategy.ts`
- Causa: `ConfigService.get()` retorna `T | undefined`; `JwtSignOptions.expiresIn` espera o branded type `StringValue` do pacote `ms`, não `string` simples
- Correção: substituir `.get()` por `.getOrThrow()` (garante non-null) e fazer cast `as JwtSignOptions['expiresIn']` para `expiresIn`; mesmo padrão com `getOrThrow` para `secretOrKey`
