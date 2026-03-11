-- 002_schema_improvements.sql
-- PostgreSQL migration with incremental improvements:
-- 1) create lesson_format enum
-- 2) alter existing columns
-- 3) create updated_at trigger function
-- 4) add triggers for all core tables

-- 1) ENUM type for lesson format
CREATE TYPE lesson_format AS ENUM ('online', 'offline');

-- 2) Column changes
ALTER TABLE payments
    ALTER COLUMN currency TYPE CHAR(3)
    USING UPPER(LEFT(currency, 3));

ALTER TABLE payments
    ALTER COLUMN currency SET DEFAULT 'USD';

ALTER TABLE lessons
    ALTER COLUMN format TYPE lesson_format
    USING (
        CASE
            WHEN format IS NULL THEN NULL
            WHEN LOWER(format) = 'online' THEN 'online'::lesson_format
            WHEN LOWER(format) = 'offline' THEN 'offline'::lesson_format
            ELSE NULL
        END
    );

-- 3) Function for auto-updating updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 4) Triggers for updated_at on all core tables
CREATE TRIGGER trg_students_updated_at
BEFORE UPDATE ON students
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER trg_lessons_updated_at
BEFORE UPDATE ON lessons
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER trg_payments_updated_at
BEFORE UPDATE ON payments
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER trg_leads_updated_at
BEFORE UPDATE ON leads
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();
