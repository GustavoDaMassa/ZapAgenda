import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateSchema1748000000000 implements MigrationInterface {
  name = 'CreateSchema1748000000000';

  async up(queryRunner: QueryRunner): Promise<void> {
    // --- Users ---
    await queryRunner.query(`
      CREATE TABLE "users" (
        "id"            UUID        NOT NULL DEFAULT gen_random_uuid(),
        "email"         VARCHAR     NOT NULL,
        "password_hash" VARCHAR     NOT NULL,
        CONSTRAINT "PK_users" PRIMARY KEY ("id"),
        CONSTRAINT "UQ_users_email" UNIQUE ("email")
      )
    `);

    // --- Categories ---
    await queryRunner.query(`
      CREATE TABLE "categories" (
        "id"                       UUID        NOT NULL DEFAULT gen_random_uuid(),
        "name"                     VARCHAR     NOT NULL,
        "color"                    VARCHAR(7)  NOT NULL,
        "default_reminder_minutes" INTEGER,
        "is_system"                BOOLEAN     NOT NULL DEFAULT false,
        CONSTRAINT "PK_categories" PRIMARY KEY ("id")
      )
    `);

    // default system categories seed
    await queryRunner.query(`
      INSERT INTO "categories" ("name", "color", "is_system") VALUES
        ('Trabalho', '#4A90E2', true),
        ('Saúde',    '#7ED321', true),
        ('Estudos',  '#9B59B6', true),
        ('Pessoal',  '#E74C3C', true),
        ('Outros',   '#95A5A6', true)
    `);

    // --- Appointments ---
    await queryRunner.query(`
      CREATE TYPE "recurrence_rule_enum" AS ENUM ('daily', 'weekly', 'monthly')
    `);
    await queryRunner.query(`
      CREATE TYPE "created_via_enum" AS ENUM ('whatsapp', 'dashboard')
    `);
    await queryRunner.query(`
      CREATE TABLE "appointments" (
        "id"              UUID                  NOT NULL DEFAULT gen_random_uuid(),
        "title"           VARCHAR               NOT NULL,
        "description"     TEXT,
        "start_time"      TIMESTAMPTZ           NOT NULL,
        "end_time"        TIMESTAMPTZ,
        "category_id"     UUID                  NOT NULL,
        "is_recurring"    BOOLEAN               NOT NULL DEFAULT false,
        "recurrence_rule" "recurrence_rule_enum",
        "is_cancelled"    BOOLEAN               NOT NULL DEFAULT false,
        "created_via"     "created_via_enum"    NOT NULL DEFAULT 'whatsapp',
        "created_at"      TIMESTAMPTZ           NOT NULL DEFAULT now(),
        "updated_at"      TIMESTAMPTZ           NOT NULL DEFAULT now(),
        CONSTRAINT "PK_appointments" PRIMARY KEY ("id"),
        CONSTRAINT "FK_appointments_category"
          FOREIGN KEY ("category_id") REFERENCES "categories" ("id")
      )
    `);

    await queryRunner.query(`
      CREATE INDEX "IDX_appointments_start_time"   ON "appointments" ("start_time")
    `);
    await queryRunner.query(`
      CREATE INDEX "IDX_appointments_category_id"  ON "appointments" ("category_id")
    `);

    // --- Reminders ---
    await queryRunner.query(`
      CREATE TYPE "reminder_status_enum" AS ENUM ('pending', 'sent', 'failed')
    `);
    await queryRunner.query(`
      CREATE TABLE "reminders" (
        "id"              UUID                    NOT NULL DEFAULT gen_random_uuid(),
        "appointment_id"  UUID                    NOT NULL,
        "minutes_before"  INTEGER                 NOT NULL,
        "status"          "reminder_status_enum"  NOT NULL DEFAULT 'pending',
        "scheduled_for"   TIMESTAMPTZ             NOT NULL,
        "sent_at"         TIMESTAMPTZ,
        CONSTRAINT "PK_reminders" PRIMARY KEY ("id"),
        CONSTRAINT "FK_reminders_appointment"
          FOREIGN KEY ("appointment_id") REFERENCES "appointments" ("id") ON DELETE CASCADE
      )
    `);

    await queryRunner.query(`
      CREATE INDEX "IDX_reminders_appointment_id"     ON "reminders" ("appointment_id")
    `);
    await queryRunner.query(`
      CREATE INDEX "IDX_reminders_status_scheduled"   ON "reminders" ("status", "scheduled_for")
    `);

    // --- Conversation sessions ---
    await queryRunner.query(`
      CREATE TYPE "conversation_state_enum" AS ENUM
        ('idle', 'awaiting_clarification', 'awaiting_confirmation')
    `);
    await queryRunner.query(`
      CREATE TABLE "conversation_sessions" (
        "id"            UUID                        NOT NULL DEFAULT gen_random_uuid(),
        "whatsapp_jid"  VARCHAR                     NOT NULL,
        "state"         "conversation_state_enum"   NOT NULL DEFAULT 'idle',
        "context"       JSONB,
        "history"       JSONB,
        "expires_at"    TIMESTAMPTZ                 NOT NULL,
        "updated_at"    TIMESTAMPTZ                 NOT NULL DEFAULT now(),
        CONSTRAINT "PK_conversation_sessions" PRIMARY KEY ("id"),
        CONSTRAINT "UQ_conversation_sessions_jid" UNIQUE ("whatsapp_jid")
      )
    `);

    await queryRunner.query(`
      CREATE INDEX "IDX_conversation_sessions_jid"
        ON "conversation_sessions" ("whatsapp_jid")
    `);
    await queryRunner.query(`
      CREATE INDEX "IDX_conversation_sessions_expires"
        ON "conversation_sessions" ("expires_at")
    `);
  }

  async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE IF EXISTS "conversation_sessions"`);
    await queryRunner.query(`DROP TYPE IF EXISTS "conversation_state_enum"`);

    await queryRunner.query(`DROP TABLE IF EXISTS "reminders"`);
    await queryRunner.query(`DROP TYPE IF EXISTS "reminder_status_enum"`);

    await queryRunner.query(`DROP TABLE IF EXISTS "appointments"`);
    await queryRunner.query(`DROP TYPE IF EXISTS "created_via_enum"`);
    await queryRunner.query(`DROP TYPE IF EXISTS "recurrence_rule_enum"`);

    await queryRunner.query(`DROP TABLE IF EXISTS "categories"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "users"`);
  }
}
