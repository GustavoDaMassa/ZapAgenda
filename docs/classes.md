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

- *(a criar na Fase 4)*

</details>

<details>
<summary><strong>src/modules/appointments/</strong></summary>

- *(a criar na Fase 5)*

</details>

<details>
<summary><strong>src/modules/categories/</strong></summary>

- *(a criar na Fase 5)*

</details>

<details>
<summary><strong>src/modules/reminders/</strong></summary>

- *(a criar na Fase 5)*

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

- **src/app.module.ts** — Módulo raiz; registra ConfigModule global e TypeOrmModule com configuração assíncrona
- **src/main.ts** — Bootstrap da aplicação; registra ValidationPipe global, CORS e Swagger em `/api/docs`

</details>

<details>
<summary><strong>web/</strong> — React Frontend</summary>

- *(estrutura de páginas e componentes a criar na Fase 5)*

</details>
