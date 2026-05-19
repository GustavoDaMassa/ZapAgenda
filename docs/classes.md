# ZapZap — Classes e Estrutura

<details>
<summary><strong>api/</strong> — NestJS Backend</summary>

<details>
<summary><strong>src/config/</strong></summary>

- **configuration.ts** — Factory de configuração tipada; lê variáveis de ambiente e expõe via ConfigService

</details>

<details>
<summary><strong>src/common/dto/</strong></summary>

- **error-response.dto.ts** — Shape padrão de erro retornado pela API: statusCode, error, message, timestamp, path

</details>

<details>
<summary><strong>src/common/exceptions/</strong></summary>

- **app.exception.ts** — Base de toda a hierarquia de exceções; estende HttpException com mensagem e status
- **not-found.exception.ts** — Lança 404 com mensagem "{resource} not found"; domínios criam subclasses

</details>

<details>
<summary><strong>src/common/filters/</strong></summary>

- **global-exception.filter.ts** — Captura todas as exceções; AppException → status do erro, desconhecida → 500
- **global-exception.filter.spec.ts** — Testes unitários do filter (4 casos: 404, conflict, 500, timestamp)

</details>

<details>
<summary><strong>src/modules/auth/</strong></summary>

<details>
<summary><strong>entities/</strong></summary>

- **user.entity.ts** — Entidade TypeORM `users`; campos: id (uuid), email (unique), passwordHash

</details>

<details>
<summary><strong>dto/</strong></summary>

- **login.dto.ts** — Payload do POST /auth/login: email (IsEmail) + password (MinLength 6)
- **refresh.dto.ts** — Payload do POST /auth/refresh: refreshToken (IsString)

</details>

<details>
<summary><strong>strategies/</strong></summary>

- **jwt.strategy.ts** — PassportStrategy JWT; extrai token do header Bearer e valida com jwt.secret

</details>

<details>
<summary><strong>guards/</strong></summary>

- **jwt-auth.guard.ts** — AuthGuard('jwt'); aplica em rotas que exigem autenticação

</details>

- **auth.service.ts** — login (valida credenciais, gera tokens), refresh (verifica refreshToken, gera novos tokens)
- **auth.service.spec.ts** — Testes unitários: login válido, usuário inexistente, senha errada
- **auth.controller.ts** — POST /auth/login e POST /auth/refresh; documentado com Swagger
- **auth.controller.spec.ts** — Testes unitários: login e refresh delegam para AuthService
- **auth.module.ts** — Registra TypeORM(User), PassportModule, JwtModule (async), estratégia e guard

</details>

<details>
<summary><strong>src/modules/categories/</strong></summary>

<details>
<summary><strong>entities/</strong></summary>

- **category.entity.ts** — Entidade TypeORM `categories`; factory `Category.create()`; campos: id, name, color, defaultReminderMinutes, isSystem
- **category.entity.spec.ts** — Testes do factory: propriedades padrão, categoria de sistema, reminder minutes

</details>

<details>
<summary><strong>dto/</strong></summary>

- **create-category.dto.ts** — name (string), color (IsHexColor), defaultReminderMinutes (opcional, int ≥ 1)
- **update-category.dto.ts** — PartialType de CreateCategoryDto

</details>

<details>
<summary><strong>exceptions/</strong></summary>

- **category-not-found.exception.ts** — 404 com mensagem "Category with id {id} not found"
- **system-category.exception.ts** — 409 ao tentar deletar categoria de sistema

</details>

- **categories.service.ts** — findAll, findOne (lança 404), create, update, remove (lança 409 se isSystem)
- **categories.service.spec.ts** — 8 testes: findAll, findOne (found/not found), create, update (found/not found), remove (ok/system/not found)
- **categories.controller.ts** — GET /categories, GET /:id, POST, PATCH /:id, DELETE /:id — protegido por JwtAuthGuard
- **categories.controller.spec.ts** — 6 testes: todos os endpoints + 404 propagado
- **categories.module.ts** — TypeORM(Category) + exports CategoriesService

</details>

<details>
<summary><strong>src/modules/appointments/</strong></summary>

<details>
<summary><strong>entities/</strong></summary>

- **appointment.entity.ts** — Enums `RecurrenceRule`, `CreatedVia`; factory `Appointment.create()`; método `cancel()`
- **appointment.entity.spec.ts** — 4 testes: defaults, createdVia, recorrência, cancel()

</details>

<details>
<summary><strong>dto/</strong></summary>

- **create-appointment.dto.ts** — title, startTime, categoryId (UUID), description?, endTime?, isRecurring?, recurrenceRule?, createdVia?
- **update-appointment.dto.ts** — PartialType de CreateAppointmentDto
- **find-appointments-query.dto.ts** — start?, end? (datestring), categoryId? (UUID) — filtros de listagem

</details>

<details>
<summary><strong>exceptions/</strong></summary>

- **appointment-not-found.exception.ts** — 404 com mensagem "Appointment with id {id} not found"

</details>

- **appointments.service.ts** — findAll (com filtros Between/categoryId), findOne (404), create, update, cancel
- **appointments.service.spec.ts** — 8 testes cobrindo todos os métodos e casos de 404
- **appointments.controller.ts** — GET /appointments?start&end&categoryId, GET /:id, POST, PATCH /:id, PATCH /:id/cancel
- **appointments.controller.spec.ts** — 6 testes incluindo 404 propagado
- **appointments.module.ts** — TypeORM(Appointment) + exports AppointmentsService

</details>

<details>
<summary><strong>src/modules/categories/</strong></summary>

- *(a criar na Fase 5)*

</details>

<details>
<summary><strong>src/modules/reminders/</strong></summary>

<details>
<summary><strong>entities/</strong></summary>

- **reminder.entity.ts** — Enum `ReminderStatus`; factory `Reminder.create()`; métodos `markAsSent()` e `markAsFailed()`
- **reminder.entity.spec.ts** — 3 testes: defaults, markAsSent (seta sentAt), markAsFailed

</details>

<details>
<summary><strong>dto/</strong></summary>

- **create-reminder.dto.ts** — minutesBefore (int ≥ 1), scheduledFor (datestring)

</details>

<details>
<summary><strong>exceptions/</strong></summary>

- **reminder-not-found.exception.ts** — 404 com mensagem "Reminder with id {id} not found"

</details>

- **reminders.service.ts** — findByAppointment, create, remove (valida appointmentId + reminderId, lança 404)
- **reminders.service.spec.ts** — 4 testes: findByAppointment, create, remove (ok/not found)
- **reminders.controller.ts** — nested route: GET/POST/DELETE `/appointments/:appointmentId/reminders/:reminderId`
- **reminders.controller.spec.ts** — 4 testes incluindo 404 propagado
- **reminders.module.ts** — TypeORM(Reminder) + exports RemindersService

</details>

<details>
<summary><strong>src/modules/whatsapp/</strong></summary>

- *(a criar na Fase 5)*

</details>

<details>
<summary><strong>src/modules/conversation/</strong></summary>

- *(a criar na Fase 5)*

</details>

<details>
<summary><strong>src/modules/nlp/</strong></summary>

- *(a criar na Fase 5)*

</details>

<details>
<summary><strong>src/queue/</strong></summary>

- *(a criar na Fase 5)*

</details>

- **src/common/exceptions/unauthorized.exception.ts** — Lança 401 com mensagem configurável (padrão: "Invalid credentials")
- **src/database/typeorm.config.ts** — DataSource isolado para o TypeORM CLI (`migration:run`, `migration:revert`)
- **src/database/migrations/1748000000000-CreateSchema.ts** — DDL completo: users, categories (+ seed), appointments, reminders, conversation_sessions; enums, FKs e índices
- **src/app.module.ts** — Módulo raiz; TypeORM com `migrationsRun: true` em produção, `synchronize: true` em dev
- **src/main.ts** — Bootstrap da aplicação; registra ValidationPipe global, CORS e Swagger em `/api/docs`

</details>

<details>
<summary><strong>web/</strong> — React Frontend</summary>

- *(estrutura de páginas e componentes a criar na Fase 5)*

</details>
