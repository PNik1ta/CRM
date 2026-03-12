const pool = require('../db/pool');

async function createPayment(req, res, next) {
  try {
    const { student_id, amount, paid_at, method, notes } = req.body;

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
        notes
      )
      VALUES ($1, $2, $3, $4, $5)
      RETURNING *`,
      [student_id, amount, paid_at, method, notes]
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
      `SELECT *
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

    const { rows } = await pool.query(
      `
      UPDATE payments
      SET amount=$1,
          method=$2,
          paid_at=$3,
          notes=$4
      WHERE id=$5
      RETURNING *
      `,
      [amount, method, paid_at, notes, id]
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
