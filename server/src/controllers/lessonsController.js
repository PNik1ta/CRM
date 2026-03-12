const pool = require('../db/pool');

async function getLessons(req, res, next) {
  try {
    const { rows } = await pool.query('SELECT * FROM lessons ORDER BY start_at DESC');
    res.json(rows);
  } catch (error) {
    next(error);
  }
}

async function createLesson(req, res, next) {
  try {
    const {
      student_id,
      start_at,
      end_at,
      subject,
      format,
      status,
      price,
      notes,
    } = req.body;

    const { rows } = await pool.query(
      `INSERT INTO lessons (student_id, start_at, end_at, subject, format, status, price, notes)
       VALUES ($1, $2, $3, $4, $5, COALESCE($6, 'planned'), $7, $8)
       RETURNING *`,
      [student_id, start_at, end_at, subject, format, status, price, notes]
    );

    res.status(201).json(rows[0]);
  } catch (error) {
    next(error);
  }
}

async function deleteLesson(req, res, next) {
  try {
    const { id } = req.params;

    const result = await pool.query(
      'DELETE FROM lessons WHERE id = $1 RETURNING id',
      [id]
    );

    if (!result.rows.length) {
      return res.status(404).json({ error: 'Lesson not found' });
    }

    return res.json({ success: true });
  } catch (error) {
    return next(error);
  }
}

module.exports = {
  getLessons,
  createLesson,
  deleteLesson,
};
