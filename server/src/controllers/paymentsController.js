const pool = require('../db/pool');
const { PAYMENT_METHODS, isValidDateString, normalizeString, assertEnumValue } = require('../utils/validation');

async function createPayment(req, res, next) {
  try {
    const { student_id, amount, paid_at, method, notes } = req.body;

    if (!student_id) {
      return res.status(400).json({ error: 'student_id is required' });
    }

    const normalizedAmount = Number(amount);

    if (!Number.isFinite(normalizedAmount) || normalizedAmount <= 0) {
      return res.status(400).json({ error: 'amount must be a number greater than 0' });
    }

    if (!isValidDateString(paid_at)) {
      return res.status(400).json({ error: 'paid_at must be a valid ISO date string' });
    }

    const methodError = assertEnumValue(method, PAYMENT_METHODS, 'method');
    if (methodError) {
      return res.status(400).json({ error: methodError });
    }

    const studentResult = await pool.query('SELECT id FROM students WHERE id = $1', [student_id]);

    if (!studentResult.rows.length) {
      return res.status(404).json({ error: 'Student not found' });
    }

    const { rows } = await pool.query(
      `INSERT INTO payments (
        student_id,
        amount,
        paid_at,
        method,
        note
      )
      VALUES ($1, $2, $3, $4, $5)
      RETURNING id, student_id, lesson_id, amount, currency, method, paid_at, status, note, note AS notes, created_at, updated_at`,
      [student_id, normalizedAmount, paid_at, method, normalizeString(notes)]
    );

    return res.status(201).json(rows[0]);
  } catch (error) {
    return next(error);
  }
}

async function getStudentPayments(req, res, next) {
  try {
    const { id } = req.params;

    const studentResult = await pool.query('SELECT id FROM students WHERE id = $1', [id]);

    if (!studentResult.rows.length) {
      return res.status(404).json({ error: 'Student not found' });
    }

    const { rows } = await pool.query(
      `SELECT id, student_id, lesson_id, amount, currency, method, paid_at, status, note, note AS notes, created_at, updated_at
      FROM payments
      WHERE student_id = $1
      ORDER BY paid_at DESC`,
      [id]
    );

    return res.json(rows);
  } catch (error) {
    return next(error);
  }
}


async function updatePayment(req, res, next) {
  try {
    const { id } = req.params;
    const { amount, method, paid_at, notes } = req.body;

    const normalizedAmount = Number(amount);

    if (!Number.isFinite(normalizedAmount) || normalizedAmount <= 0) {
      return res.status(400).json({ error: 'amount must be a number greater than 0' });
    }

    if (!isValidDateString(paid_at)) {
      return res.status(400).json({ error: 'paid_at must be a valid ISO date string' });
    }

    const methodError = assertEnumValue(method, PAYMENT_METHODS, 'method');
    if (methodError) {
      return res.status(400).json({ error: methodError });
    }

    const { rows } = await pool.query(
      `
      UPDATE payments
      SET amount=$1,
          method=$2,
          paid_at=$3,
          note=$4
      WHERE id=$5
      RETURNING id, student_id, lesson_id, amount, currency, method, paid_at, status, note, note AS notes, created_at, updated_at
      `,
      [normalizedAmount, method, paid_at, normalizeString(notes), id]
    );

    if (!rows.length) {
      return res.status(404).json({ error: 'Payment not found' });
    }

    return res.json(rows[0]);
  } catch (error) {
    return next(error);
  }
}

async function deletePayment(req, res, next) {
  try {
    const { id } = req.params;

    const result = await pool.query(
      'DELETE FROM payments WHERE id = $1 RETURNING id',
      [id]
    );

    if (!result.rows.length) {
      return res.status(404).json({ error: 'Payment not found' });
    }

    return res.json({ success: true });
  } catch (error) {
    return next(error);
  }
}

module.exports = {
  createPayment,
  getStudentPayments,
  updatePayment,
  deletePayment,
};
