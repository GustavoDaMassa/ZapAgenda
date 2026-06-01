-- Users
CREATE TABLE IF NOT EXISTS "users" (
  "id"            UUID        NOT NULL DEFAULT gen_random_uuid(),
  "email"         VARCHAR     NOT NULL,
  "password_hash" VARCHAR     NOT NULL,
  "whatsapp_jid"  VARCHAR     UNIQUE,
  CONSTRAINT "PK_users" PRIMARY KEY ("id"),
  CONSTRAINT "UQ_users_email" UNIQUE ("email")
);

-- Categories (user_id nullable = system category)
CREATE TABLE IF NOT EXISTS "categories" (
  "id"                       UUID       NOT NULL DEFAULT gen_random_uuid(),
  "name"                     VARCHAR    NOT NULL,
  "color"                    VARCHAR(7) NOT NULL,
  "default_reminder_minutes" INTEGER,
  "is_system"                BOOLEAN    NOT NULL DEFAULT false,
  "user_id"                  UUID,
  CONSTRAINT "PK_categories" PRIMARY KEY ("id"),
  CONSTRAINT "FK_categories_user" FOREIGN KEY ("user_id") REFERENCES "users" ("id") ON DELETE CASCADE
);

-- System categories seed
INSERT INTO "categories" ("name", "color", "is_system") VALUES
  ('Trabalho', '#4A90E2', true),
  ('Saúde',    '#7ED321', true),
  ('Estudos',  '#9B59B6', true),
  ('Pessoal',  '#E74C3C', true),
  ('Outros',   '#95A5A6', true)
ON CONFLICT DO NOTHING;

-- Appointments
DO $$ BEGIN CREATE TYPE "recurrence_rule_enum" AS ENUM ('daily','weekly','monthly'); EXCEPTION WHEN duplicate_object THEN null; END $$;
DO $$ BEGIN CREATE TYPE "created_via_enum" AS ENUM ('whatsapp','dashboard'); EXCEPTION WHEN duplicate_object THEN null; END $$;

CREATE TABLE IF NOT EXISTS "appointments" (
  "id"              UUID                NOT NULL DEFAULT gen_random_uuid(),
  "title"           VARCHAR             NOT NULL,
  "description"     TEXT,
  "start_time"      TIMESTAMPTZ         NOT NULL,
  "end_time"        TIMESTAMPTZ,
  "category_id"     UUID                NOT NULL,
  "user_id"         UUID                NOT NULL,
  "is_recurring"    BOOLEAN             NOT NULL DEFAULT false,
  "recurrence_rule" "recurrence_rule_enum",
  "is_cancelled"    BOOLEAN             NOT NULL DEFAULT false,
  "created_via"     "created_via_enum"  NOT NULL DEFAULT 'whatsapp',
  "created_at"      TIMESTAMPTZ         NOT NULL DEFAULT now(),
  "updated_at"      TIMESTAMPTZ         NOT NULL DEFAULT now(),
  CONSTRAINT "PK_appointments" PRIMARY KEY ("id"),
  CONSTRAINT "FK_appointments_category" FOREIGN KEY ("category_id") REFERENCES "categories" ("id"),
  CONSTRAINT "FK_appointments_user"     FOREIGN KEY ("user_id")     REFERENCES "users" ("id") ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS "IDX_appointments_start_time"  ON "appointments" ("start_time");
CREATE INDEX IF NOT EXISTS "IDX_appointments_category_id" ON "appointments" ("category_id");
CREATE INDEX IF NOT EXISTS "IDX_appointments_user_id"     ON "appointments" ("user_id");

-- Reminders
CREATE TABLE IF NOT EXISTS "reminders" (
  "id"             UUID        NOT NULL DEFAULT gen_random_uuid(),
  "appointment_id" UUID        NOT NULL,
  "minutes_before" INTEGER     NOT NULL,
  "status"         VARCHAR     NOT NULL DEFAULT 'pending',
  "scheduled_for"  TIMESTAMPTZ NOT NULL,
  "sent_at"        TIMESTAMPTZ,
  CONSTRAINT "PK_reminders" PRIMARY KEY ("id"),
  CONSTRAINT "FK_reminders_appointment" FOREIGN KEY ("appointment_id") REFERENCES "appointments" ("id") ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS "IDX_reminders_appointment_id"   ON "reminders" ("appointment_id");
CREATE INDEX IF NOT EXISTS "IDX_reminders_status_scheduled" ON "reminders" ("status", "scheduled_for");
