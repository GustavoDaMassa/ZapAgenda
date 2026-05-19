import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { PostgreSqlContainer, StartedPostgreSqlContainer } from '@testcontainers/postgresql';
import * as bcrypt from 'bcrypt';
import supertest from 'supertest';
import { DataSource } from 'typeorm';
import { AppModule } from '../src/app.module';
import { GlobalExceptionFilter } from '../src/common/filters/global-exception.filter';

describe('ZapZap API (e2e smoke test)', () => {
  let app: INestApplication;
  let container: StartedPostgreSqlContainer;
  let dataSource: DataSource;
  let accessToken: string;

  beforeAll(async () => {
    container = await new PostgreSqlContainer('postgres:15-alpine')
      .withDatabase('zapzap_test')
      .withUsername('zapzap')
      .withPassword('zapzap')
      .start();

    process.env.DB_HOST = container.getHost();
    process.env.DB_PORT = String(container.getMappedPort(5432));
    process.env.DB_USER = 'zapzap';
    process.env.DB_PASS = 'zapzap';
    process.env.DB_NAME = 'zapzap_test';
    process.env.NODE_ENV = 'development';
    process.env.JWT_SECRET = 'test_jwt_secret';
    process.env.JWT_REFRESH_SECRET = 'test_refresh_secret';
    process.env.JWT_EXPIRES_IN = '15m';
    process.env.JWT_REFRESH_EXPIRES_IN = '7d';

    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(
      new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true }),
    );
    app.useGlobalFilters(new GlobalExceptionFilter());
    await app.init();

    dataSource = moduleFixture.get(DataSource);
    await seedTestUser(dataSource);
  }, 60000);

  afterAll(async () => {
    await app.close();
    await container.stop();
  });

  describe('POST /auth/login', () => {
    it('should return 401 for invalid credentials', async () => {
      await supertest(app.getHttpServer())
        .post('/auth/login')
        .send({ email: 'wrong@test.com', password: 'wrongpass' })
        .expect(401);
    });

    it('should return 400 for malformed payload', async () => {
      await supertest(app.getHttpServer())
        .post('/auth/login')
        .send({ email: 'not-an-email', password: '123' })
        .expect(400);
    });

    it('should return tokens for valid credentials', async () => {
      const res = await supertest(app.getHttpServer())
        .post('/auth/login')
        .send({ email: 'test@zapzap.com', password: 'testpassword123' })
        .expect(200);

      expect(res.body.accessToken).toBeDefined();
      expect(res.body.refreshToken).toBeDefined();
      accessToken = res.body.accessToken;
    });
  });

  describe('GET /categories', () => {
    it('should return 401 without token', async () => {
      await supertest(app.getHttpServer()).get('/categories').expect(401);
    });

    it('should return 200 with valid token and system categories', async () => {
      const res = await supertest(app.getHttpServer())
        .get('/categories')
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(200);

      expect(Array.isArray(res.body)).toBe(true);
    });
  });

  describe('GET /appointments', () => {
    it('should return 401 without token', async () => {
      await supertest(app.getHttpServer()).get('/appointments').expect(401);
    });

    it('should return 200 with valid token', async () => {
      const res = await supertest(app.getHttpServer())
        .get('/appointments')
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(200);

      expect(Array.isArray(res.body)).toBe(true);
    });
  });

  describe('GET /appointments/:id (not found)', () => {
    it('should return 404 with standard error body', async () => {
      const res = await supertest(app.getHttpServer())
        .get('/appointments/00000000-0000-0000-0000-000000000000')
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(404);

      expect(res.body.statusCode).toBe(404);
      expect(res.body.error).toBe('Not Found');
      expect(res.body.message).toContain('not found');
      expect(res.body.timestamp).toBeDefined();
    });
  });
});

async function seedTestUser(dataSource: DataSource): Promise<void> {
  const passwordHash = await bcrypt.hash('testpassword123', 10);
  await dataSource.query(
    `INSERT INTO users (email, password_hash) VALUES ($1, $2)
     ON CONFLICT (email) DO NOTHING`,
    ['test@zapzap.com', passwordHash],
  );
}
