CREATE INDEX idx_lessons_student_start
ON lessons(student_id, start_at);

CREATE INDEX idx_payments_student_paid
ON payments(student_id, paid_at);
