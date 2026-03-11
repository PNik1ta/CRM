# CRM for Private Teacher

A minimal single-user CRM for one teacher.

## 1. Entity list

1. **students** — people who take lessons.
2. **lessons** — scheduled/completed teaching sessions.
3. **payments** — money received for lessons/packages.
4. **leads** — requests submitted from the landing page.

---

## 2. Table fields

### `students`
- `id` (PK, UUID or INT)
- `first_name` (text, required)
- `last_name` (text, optional)
- `phone` (text, optional)
- `email` (text, optional)
- `parent_name` (text, optional; useful for child students)
- `notes` (text, optional)
- `status` (enum/text: `active`, `paused`, `inactive`)
- `created_at` (datetime)
- `updated_at` (datetime)

### `lessons`
- `id` (PK)
- `student_id` (FK -> students.id, required)
- `start_at` (datetime, required)
- `end_at` (datetime, required)
- `subject` (text, optional)
- `format` (enum/text: `online`, `offline`)
- `status` (enum/text: `planned`, `completed`, `cancelled`, `no_show`)
- `price` (decimal, optional; snapshot price for this lesson)
- `notes` (text, optional)
- `created_at` (datetime)
- `updated_at` (datetime)

### `payments`
- `id` (PK)
- `student_id` (FK -> students.id, required)
- `lesson_id` (FK -> lessons.id, optional; null if payment is for package/prepay)
- `amount` (decimal, required)
- `currency` (text, default like `USD`)
- `method` (enum/text: `cash`, `bank_transfer`, `card`, `other`)
- `paid_at` (datetime, required)
- `status` (enum/text: `received`, `pending`, `refunded`)
- `note` (text, optional)
- `created_at` (datetime)

### `leads`
- `id` (PK)
- `name` (text, required)
- `phone` (text, optional)
- `email` (text, optional)
- `message` (text, optional)
- `source` (text, optional; e.g., landing page campaign)
- `status` (enum/text: `new`, `contacted`, `converted`, `closed`)
- `student_id` (FK -> students.id, optional; set when converted)
- `created_at` (datetime)
- `updated_at` (datetime)

---

## 3. Relationships

1. **students 1 -> many lessons**  
   One student can have many lessons.

2. **students 1 -> many payments**  
   One student can have many payment records.

3. **lessons 1 -> many payments (optional link)**  
   A payment may be linked to a specific lesson, but does not have to be (for prepayments/packages).

4. **leads 0..1 -> 1 student (conversion)**  
   A lead may be converted into a student; before conversion `student_id` is null.

---

## 4. Suggested simple stack (backend + database + frontend)

- **Backend:** Node.js + Express (REST API)
- **Database:** PostgreSQL
- **Frontend (CRM):** React + Vite
- **Landing page form integration:** POST request from landing page to backend endpoint (e.g. `/api/leads`)
- **Auth:** Very simple single-user login (one teacher account), or even basic password gate initially

### Why this is simple and enough
- 4 core tables cover the required workflow.
- No complex multi-user roles.
- No microservices.
- Easy to run locally or on one small VPS.
