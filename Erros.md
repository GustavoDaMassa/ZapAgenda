# Erros — ZapAgenda

Registro de bugs identificados e corrigidos durante o desenvolvimento.

---

**2026-05-25 · Fase 5 · Type alias em decorator com `emitDecoratorMetadata`**
- Erro: `TS1272: A type referenced in a decorated signature must be imported with 'import type'` — `CreatedVia` e `RecurrenceRule` usados como valor em `@IsEnum`
- Causa: `type` aliases não existem em runtime; `emitDecoratorMetadata` exige que tipos em assinaturas decoradas sejam importados com `import type`
- Correção: usar `import type` para os aliases e definir const arrays `['whatsapp', 'dashboard']` como argumento do `@IsEnum`

---

## TypeORM 1.x — @ManyToOne sem @JoinColumn ignora o name do @Column FK

**Indícios:** `POST /api/appointments` retornava 500; log revelava `QueryFailedError: column a.categoryId does not exist` — TypeORM gerava SQL com o nome da propriedade camelCase em vez do nome real da coluna snake_case.

**Diagnóstico:** Em TypeORM 1.x (breaking change em relação ao 0.3.x), ao declarar `@ManyToOne` sem `@JoinColumn` explícito, o mapeamento entre a propriedade `categoryId` e a coluna `category_id` não é respeitado. O ORM gera `"AppointmentOrmEntity"."categoryId"` em vez de `category_id` nas operações de `save()`.

**Causa raiz:** TypeORM 1.x alterou o comportamento padrão de inferência do join column: sem `@JoinColumn`, a opção `name` do `@Column` que declara a FK não é usada como referência para a relação, gerando conflito entre a coluna explícita e a coluna implícita da relação.

**Solução:** Adicionado `@JoinColumn({ name: 'category_id' })` e `@JoinColumn({ name: 'user_id' })` em todas as decorações `@ManyToOne` do `appointment.orm-entity.ts`.

**Commit:** *(fix inline, sem commit separado)*

**Lição:** No TypeORM 1.x, toda relação `@ManyToOne` com FK de nome customizado (snake_case) exige `@JoinColumn({ name: '...' })` explícito. Aplicar o mesmo padrão em todos os ORM entities do projeto.

---

**2026-05-24 · Fase 4 · `expiresIn` e `secretOrKey` com tipo incompatível no NestJS JWT**
- Erro: `Type 'string' is not assignable to type 'number | StringValue | undefined'` em `jwt.service.ts`; `Type 'string | undefined'` em `jwt.strategy.ts`
- Causa: `ConfigService.get()` retorna `T | undefined`; `JwtSignOptions.expiresIn` espera o branded type `StringValue` do pacote `ms`, não `string` simples
- Correção: substituir `.get()` por `.getOrThrow()` (garante non-null) e fazer cast `as JwtSignOptions['expiresIn']` para `expiresIn`; mesmo padrão com `getOrThrow` para `secretOrKey`
