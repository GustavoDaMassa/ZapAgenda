export default () => ({
  port: parseInt(process.env.PORT ?? '3000', 10),
  nodeEnv: process.env.NODE_ENV ?? 'development',
  database: {
    host: process.env.DB_HOST ?? 'localhost',
    port: parseInt(process.env.DB_PORT ?? '5432', 10),
    username: process.env.DB_USER ?? 'zapzap',
    password: process.env.DB_PASS ?? 'zapzap',
    name: process.env.DB_NAME ?? 'zapzap',
  },
  jwt: {
    secret: process.env.JWT_SECRET ?? 'dev_secret',
    expiresIn: process.env.JWT_EXPIRES_IN ?? '15m',
    refreshSecret: process.env.JWT_REFRESH_SECRET ?? 'dev_refresh_secret',
    refreshExpiresIn: process.env.JWT_REFRESH_EXPIRES_IN ?? '7d',
  },
  rabbitmq: {
    url: process.env.RABBITMQ_URL ?? 'amqp://guest:guest@localhost:5672',
    remindersQueue: process.env.RABBITMQ_REMINDERS_QUEUE ?? 'reminders',
  },
  gemini: {
    apiKey: process.env.GEMINI_API_KEY ?? '',
    model: process.env.GEMINI_MODEL ?? 'gemini-1.5-flash',
  },
  whatsapp: {
    authPath: process.env.WHATSAPP_AUTH_PATH ?? './baileys_auth_info',
    phoneNumber: process.env.WHATSAPP_PHONE_NUMBER ?? '',
  },
});
