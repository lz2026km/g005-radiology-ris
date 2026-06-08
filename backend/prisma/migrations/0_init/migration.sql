-- G005 放射RIS系统 v3.0.1 - 初始迁移
-- 由 `prisma migrate dev --name 0_init` 自动生成
-- 注意:此 SQL 需在 prisma migrate dev 后由 prisma 生成;此处为参考版本

CREATE TYPE "UserRole" AS ENUM ('DOCTOR', 'TECHNICIAN', 'NURSE', 'ADMIN', 'DIRECTOR');
CREATE TYPE "Gender" AS ENUM ('MALE', 'FEMALE', 'OTHER');
CREATE TYPE "ReportState" AS ENUM (
  'PENDING_ASSIGNMENT', 'ASSIGNED', 'WRITING', 'SUBMITTED', 'REVIEWING', 'REVIEWED',
  'SIGNING', 'SIGNED', 'PUBLISHED', 'AMENDING', 'AMENDED', 'WITHDRAWN', 'REJECTED', 'ARCHIVED'
);
CREATE TYPE "DeviceState" AS ENUM ('IDLE', 'IN_USE', 'MAINTENANCE', 'BROKEN', 'OFFLINE');
CREATE TYPE "CriticalState" AS ENUM ('FOUND', 'NOTIFIED', 'ACKNOWLEDGED', 'RESOLVING', 'RESOLVED');
CREATE TYPE "CriticalSeverity" AS ENUM ('LOW', 'HIGH', 'URGENT', 'CRITICAL');
CREATE TYPE "NotificationMethod" AS ENUM ('PHONE', 'SMS', 'SYSTEM', 'EMAIL', 'WECHAT');
CREATE TYPE "PatientType" AS ENUM ('OUTPATIENT', 'INPATIENT', 'EMERGENCY', 'PHYSICAL');
CREATE TYPE "AppointmentState" AS ENUM ('SCHEDULED', 'CHECKED_IN', 'CANCELLED', 'COMPLETED', 'NO_SHOW');
CREATE TYPE "RadsCategory" AS ENUM ('BI_RADS', 'LI_RADS', 'PI_RADS', 'TI_RADS', 'CAD_RADS', 'C_RADS', 'O_RADS', 'NI_RADS');
CREATE TYPE "WorklistOpType" AS ENUM ('ASSIGN', 'REASSIGN', 'START', 'COMPLETE', 'CANCEL', 'PRINT', 'EXPORT');

CREATE TABLE "users" (
  "id" TEXT PRIMARY KEY,
  "username" TEXT UNIQUE NOT NULL,
  "password_hash" TEXT NOT NULL,
  "full_name" TEXT NOT NULL,
  "role" "UserRole" NOT NULL,
  "department" TEXT,
  "active" BOOLEAN NOT NULL DEFAULT true,
  "created_at" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMP NOT NULL
);

CREATE TABLE "patients" (
  "id" TEXT PRIMARY KEY,
  "name" TEXT NOT NULL,
  "gender" "Gender" NOT NULL,
  "birth_date" TIMESTAMP,
  "id_card" TEXT UNIQUE,
  "phone" TEXT,
  "type" "PatientType" NOT NULL DEFAULT 'OUTPATIENT',
  "created_at" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMP NOT NULL
);
CREATE INDEX "patients_name_phone_idx" ON "patients"("name", "phone");

CREATE TABLE "devices" (
  "id" TEXT PRIMARY KEY,
  "code" TEXT UNIQUE NOT NULL,
  "name" TEXT NOT NULL,
  "modality" TEXT NOT NULL,
  "manufacturer" TEXT,
  "location" TEXT,
  "state" "DeviceState" NOT NULL DEFAULT 'IDLE',
  "today_exams" INTEGER NOT NULL DEFAULT 0,
  "today_usage_min" INTEGER NOT NULL DEFAULT 0,
  "created_at" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMP NOT NULL
);

CREATE TABLE "exams" (
  "id" TEXT PRIMARY KEY,
  "patient_id" TEXT NOT NULL REFERENCES "patients"("id"),
  "accession_number" TEXT UNIQUE NOT NULL,
  "modality" TEXT NOT NULL,
  "body_part" TEXT NOT NULL,
  "scheduled_at" TIMESTAMP,
  "started_at" TIMESTAMP,
  "completed_at" TIMESTAMP,
  "device_id" TEXT REFERENCES "devices"("id"),
  "state" TEXT NOT NULL DEFAULT 'SCHEDULED',
  "created_at" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX "exams_patient_id_modality_idx" ON "exams"("patient_id", "modality");

CREATE TABLE "reports" (
  "id" TEXT PRIMARY KEY,
  "patient_id" TEXT NOT NULL REFERENCES "patients"("id"),
  "exam_id" TEXT REFERENCES "exams"("id"),
  "radiologist_id" TEXT REFERENCES "users"("id"),
  "state" "ReportState" NOT NULL DEFAULT 'PENDING_ASSIGNMENT',
  "findings" TEXT NOT NULL DEFAULT '',
  "conclusion" TEXT NOT NULL DEFAULT '',
  "signed_at" TIMESTAMP,
  "is_critical" BOOLEAN NOT NULL DEFAULT false,
  "quality_score" INTEGER,
  "created_at" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMP NOT NULL
);
CREATE INDEX "reports_state_patient_id_idx" ON "reports"("state", "patient_id");

CREATE TABLE "report_revisions" (
  "id" TEXT PRIMARY KEY,
  "report_id" TEXT NOT NULL REFERENCES "reports"("id") ON DELETE CASCADE,
  "actor_id" TEXT NOT NULL,
  "from_state" "ReportState" NOT NULL,
  "to_state" "ReportState" NOT NULL,
  "reason" TEXT,
  "created_at" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX "report_revisions_report_id_created_at_idx" ON "report_revisions"("report_id", "created_at");

CREATE TABLE "critical_values" (
  "id" TEXT PRIMARY KEY,
  "exam_id" TEXT,
  "description" TEXT NOT NULL,
  "severity" "CriticalSeverity" NOT NULL DEFAULT 'HIGH',
  "state" "CriticalState" NOT NULL DEFAULT 'FOUND',
  "method" "NotificationMethod" NOT NULL DEFAULT 'SYSTEM',
  "notified_to" TEXT,
  "acked_by" TEXT,
  "acked_at" TIMESTAMP,
  "resolved_by" TEXT,
  "resolved_at" TIMESTAMP,
  "created_at" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMP NOT NULL
);
CREATE INDEX "critical_values_state_severity_idx" ON "critical_values"("state", "severity");

CREATE TABLE "appointments" (
  "id" TEXT PRIMARY KEY,
  "patient_id" TEXT NOT NULL REFERENCES "patients"("id"),
  "device_id" TEXT REFERENCES "devices"("id"),
  "modality" TEXT NOT NULL,
  "scheduled_at" TIMESTAMP NOT NULL,
  "state" "AppointmentState" NOT NULL DEFAULT 'SCHEDULED',
  "created_at" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX "appointments_scheduled_at_state_idx" ON "appointments"("scheduled_at", "state");

CREATE TABLE "rads_templates" (
  "id" TEXT PRIMARY KEY,
  "category" "RadsCategory" NOT NULL,
  "code" TEXT NOT NULL,
  "name" TEXT NOT NULL,
  "body" TEXT NOT NULL,
  "parent_id" TEXT,
  "created_at" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX "rads_templates_category_code_idx" ON "rads_templates"("category", "code");

CREATE TABLE "worklist_ops" (
  "id" TEXT PRIMARY KEY,
  "actor_id" TEXT NOT NULL REFERENCES "users"("id"),
  "op" "WorklistOpType" NOT NULL,
  "exam_id" TEXT,
  "payload" JSONB,
  "created_at" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX "worklist_ops_actor_id_created_at_idx" ON "worklist_ops"("actor_id", "created_at");

CREATE TABLE "system_config" (
  "key" TEXT PRIMARY KEY,
  "value" JSONB NOT NULL,
  "updated_at" TIMESTAMP NOT NULL
);

CREATE TABLE "login_logs" (
  "id" TEXT PRIMARY KEY,
  "user_id" TEXT NOT NULL REFERENCES "users"("id"),
  "ip" TEXT NOT NULL,
  "user_agent" TEXT,
  "success" BOOLEAN NOT NULL,
  "created_at" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX "login_logs_user_id_created_at_idx" ON "login_logs"("user_id", "created_at");
