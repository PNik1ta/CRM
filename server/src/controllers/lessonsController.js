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
       VALUES ($1, $2, $3, $4, $5::lesson_format, COALESCE($6::lesson_status, 'planned'::lesson_status), $7, $8)
       RETURNING *`,
      [student_id, start_at, end_at, subject, format, status, price, notes]
    );

    res.status(201).json(rows[0]);
  } catch (error) {
    next(error);
  }
}


async function updateLesson(req, res, next) {
  try {
    const { id } = req.params;
    const {
      start_at,
      end_at,
      subject,
      format,
      price,
      notes,
    } = req.body;

    const { rows } = await pool.query(
      `
      UPDATE lessons
      SET start_at=$1,
          end_at=$2,
          subject=$3,
          format=$4,
          price=$5,
          notes=$6
      WHERE id=$7
      RETURNING *
      `,
      [start_at, end_at, subject, format, price, notes, id]
    );

    if (!rows.length) {
      return res.status(404).json({ error: 'Lesson not found' });
    }

    res.json(rows[0]);
  } catch (err) {
    next(err);
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
  updateLesson,
  deleteLesson,
};
