const pool = require('../db/pool');

async function getPayments(req, res, next) {
  try {
    const { rows } = await pool.query('SELECT * FROM payments ORDER BY paid_at DESC');
    res.json(rows);
  } catch (error) {
    next(error);
  }
}

async function createPayment(req, res, next) {
  try {
    const {
      student_id,
      lesson_id,
      amount,
      currency,
      method,
      paid_at,
      status,
      note,
    } = req.body;

    const { rows } = await pool.query(
      `INSERT INTO payments (student_id, lesson_id, amount, currency, method, paid_at, status, note)
       VALUES ($1, $2, $3, COALESCE($4, 'USD'), $5, $6, COALESCE($7, 'received'), $8)
       RETURNING *`,
      [student_id, lesson_id || null, amount, currency, method, paid_at, status, note]
    );

    res.status(201).json(rows[0]);
  } catch (error) {
    next(error);
  }
}

module.exports = {
  getPayments,
  createPayment,
};
