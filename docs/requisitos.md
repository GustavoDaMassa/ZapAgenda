# ZapZap — Requisitos

## Requisitos Funcionais

**RF01 — Gestão de compromissos via WhatsApp**
- Criar compromisso em linguagem natural ("marca dentista sexta às 15h")
- Consultar compromissos (hoje, amanhã, semana, data específica)
- Editar compromisso (horário, nome, categoria)
- Cancelar compromisso
- Remarcar compromisso
- Compromissos recorrentes (diário, semanal, mensal)

**RF02 — Categorias**
- Categorias padrão com cores: trabalho, saúde, estudos, pessoal, outros
- Criação de categorias personalizadas
- Categorias padrão não podem ser deletadas (is_system = true)

**RF03 — Lembretes automáticos**
- Antecedência configurável por compromisso ou por categoria
- Múltiplos lembretes por evento (ex: 1 dia antes + 30 min antes)
- Entregues via WhatsApp pelo próprio bot
- Gerenciados via RabbitMQ com TTL (sem cron job)
- Lembrete padrão: 30 min se nenhuma antecedência configurada

**RF04 — Contexto de conversa**
- Sessão ativa por ~5 minutos após última mensagem
- IA recebe histórico da sessão como contexto (últimas N mensagens)
- IA interpreta intenção e extrai entidades (data, hora, título, categoria)
- Bot pede esclarecimento quando a mensagem for ambígua
- Confirmação explícita antes de cancelar ou remarcar
- Fallback quando a IA não entender: "Não entendi. Pode reformular?"
- Suporte a mensagens de áudio via Gemini multimodal

**RF05 — Dashboard React**
- Visão de calendário (mês / semana / dia)
- Lista de próximos compromissos
- Criar e editar compromissos diretamente pelo dashboard
- Histórico com filtros por categoria e período
- Analytics: horas por categoria, compromissos cumpridos vs. cancelados
- Tela de configurações: categorias e antecedência padrão de lembrete

**RF06 — Autenticação**
- Login com e-mail e senha (uso pessoal — único usuário)
- JWT para proteger a API e o dashboard
- Refresh token

---

## Requisitos Não-Funcionais

- Resposta ao WhatsApp em menos de 2 segundos
- Reconexão automática do Baileys em caso de queda
- Sessão Baileys persistida em volume Docker (sem novo QR code a cada restart)
- Conflito de horário: bot alerta antes de confirmar agendamento conflitante
- Fuso horário fixo: America/Sao_Paulo (UTC-3)
- Secrets via variáveis de ambiente — nada hardcoded
- Todos os serviços containerizados (Docker Compose)
- Deploy via GitHub Actions → Docker Hub → Watchtower

---

## Fora do escopo (MVP)

- Compartilhamento de agenda com outras pessoas
- Integração com calendários externos (Google Calendar, etc.)
- Multi-usuário / multi-dispositivo
- Notificações push no React
