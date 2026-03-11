-- PostgreSQL schema for simple single-user CRM
-- Order:
-- 1) ENUM types
-- 2) Tables
-- 3) Foreign keys
-- 4) Indexes

CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- 1) ENUM types
CREATE TYPE student_status AS ENUM ('active', 'paused', 'inactive');
CREATE TYPE lesson_status AS ENUM ('planned', 'completed', 'cancelled', 'no_show');
CREATE TYPE payment_status AS ENUM ('received', 'pending', 'refunded');
CREATE TYPE lead_status AS ENUM ('new', 'contacted', 'converted', 'closed');

-- 2) Tables
CREATE TABLE students (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    first_name TEXT NOT NULL,
    last_name TEXT,
    phone TEXT,
    email TEXT,
    parent_name TEXT,
    notes TEXT,
    status student_status NOT NULL DEFAULT 'active',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE lessons (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    student_id UUID NOT NULL,
    start_at TIMESTAMPTZ NOT NULL,
    end_at TIMESTAMPTZ NOT NULL,
    subject TEXT,
    format TEXT,
    status lesson_status NOT NULL DEFAULT 'planned',
    price NUMERIC(10, 2),
    notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT lessons_time_check CHECK (end_at > start_at)
);

CREATE TABLE payments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    student_id UUID NOT NULL,
    lesson_id UUID,
    amount NUMERIC(10, 2) NOT NULL CHECK (amount >= 0),
    currency TEXT NOT NULL DEFAULT 'USD',
    method TEXT,
    paid_at TIMESTAMPTZ NOT NULL,
    status payment_status NOT NULL DEFAULT 'received',
    note TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE leads (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    phone TEXT,
    email TEXT,
    message TEXT,
    source TEXT,
    status lead_status NOT NULL DEFAULT 'new',
    student_id UUID,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 3) Foreign keys
ALTER TABLE lessons
    ADD CONSTRAINT fk_lessons_student
    FOREIGN KEY (student_id)
    REFERENCES students(id)
    ON DELETE RESTRICT;

ALTER TABLE payments
    ADD CONSTRAINT fk_payments_student
    FOREIGN KEY (student_id)
    REFERENCES students(id)
    ON DELETE RESTRICT;

ALTER TABLE payments
    ADD CONSTRAINT fk_payments_lesson
    FOREIGN KEY (lesson_id)
    REFERENCES lessons(id)
    ON DELETE SET NULL;

ALTER TABLE leads
    ADD CONSTRAINT fk_leads_student
    FOREIGN KEY (student_id)
    REFERENCES students(id)
    ON DELETE SET NULL;

-- 4) Indexes
CREATE INDEX idx_lessons_student_id ON lessons(student_id);
CREATE INDEX idx_payments_student_id ON payments(student_id);
CREATE INDEX idx_payments_lesson_id ON payments(lesson_id);
CREATE INDEX idx_leads_student_id ON leads(student_id);
CREATE INDEX idx_leads_status ON leads(status);
