-- 004_seed_data.sql
-- Seed data for local development demo (students, lessons, payments)

INSERT INTO students (id, first_name, last_name, phone, email, parent_name, notes, status)
VALUES
  (
    '11111111-1111-1111-1111-111111111111',
    'Ivan',
    'Ivanov',
    '+123456789',
    'ivan@example.com',
    'Elena Ivanova',
    'Prefers evening classes.',
    'active'
  ),
  (
    '22222222-2222-2222-2222-222222222222',
    'Anna',
    'Petrova',
    '+987654321',
    'anna@example.com',
    'Oleg Petrov',
    'Preparing for language exam.',
    'active'
  ),
  (
    '33333333-3333-3333-3333-333333333333',
    'Sergey',
    'Sidorov',
    '+111222333',
    'sergey@example.com',
    NULL,
    'Needs flexible schedule due to sports.',
    'paused'
  );

INSERT INTO lessons (
  id,
  student_id,
  subject,
  start_at,
  end_at,
  price,
  format,
  status,
  notes
)
VALUES
  (
    'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaa1',
    '11111111-1111-1111-1111-111111111111',
    'Math',
    '2025-01-10 10:00+00',
    '2025-01-10 11:00+00',
    50,
    'online',
    'completed',
    'Algebra practice.'
  ),
  (
    'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaa2',
    '11111111-1111-1111-1111-111111111111',
    'Math',
    '2025-01-12 10:00+00',
    '2025-01-12 11:00+00',
    50,
    'online',
    'completed',
    'Geometry basics.'
  ),
  (
    'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaa3',
    '11111111-1111-1111-1111-111111111111',
    'Math',
    '2025-01-15 10:00+00',
    '2025-01-15 11:00+00',
    55,
    'offline',
    'planned',
    'Mock test in classroom.'
  ),
  (
    'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbb1',
    '22222222-2222-2222-2222-222222222222',
    'English',
    '2025-01-11 14:00+00',
    '2025-01-11 15:00+00',
    40,
    'offline',
    'completed',
    'Reading comprehension.'
  ),
  (
    'cccccccc-cccc-cccc-cccc-ccccccccccc1',
    '33333333-3333-3333-3333-333333333333',
    'Physics',
    '2025-01-13 16:30+00',
    '2025-01-13 17:30+00',
    45,
    'online',
    'cancelled',
    'Cancelled due to competition.'
  );

INSERT INTO payments (
  id,
  student_id,
  lesson_id,
  amount,
  currency,
  method,
  paid_at,
  status,
  note
)
VALUES
  (
    'dddddddd-dddd-dddd-dddd-ddddddddddd1',
    '11111111-1111-1111-1111-111111111111',
    'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaa1',
    100,
    'USD',
    'card',
    '2025-01-09 12:00+00',
    'received',
    'Prepaid for two lessons.'
  ),
  (
    'dddddddd-dddd-dddd-dddd-ddddddddddd2',
    '11111111-1111-1111-1111-111111111111',
    'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaa3',
    55,
    'USD',
    'bank transfer',
    '2025-01-14 18:00+00',
    'pending',
    'Payment processing by bank.'
  ),
  (
    'eeeeeeee-eeee-eeee-eeee-eeeeeeeeeee1',
    '22222222-2222-2222-2222-222222222222',
    'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbb1',
    40,
    'USD',
    'cash',
    '2025-01-11 16:00+00',
    'received',
    'Paid after class.'
  );
