const pool = require('../db/pool');
const {
  LESSON_FORMATS,
  LESSON_STATUSES,
  isValidDateString,
  normalizeString,
  assertEnumValue,
} = require('../utils/validation');

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
    const { student_id } = req.body;
    const {
      start_at,
      end_at,
      subject,
      format,
      status,
      price,
      notes,
    } = req.body;

    if (!student_id) {
      return res.status(400).json({ error: 'student_id is required' });
    }

    if (!start_at || !end_at) {
      return res.status(400).json({ error: 'start_at and end_at are required' });
    }

    if (!isValidDateString(start_at) || !isValidDateString(end_at)) {
      return res.status(400).json({ error: 'start_at and end_at must be valid ISO date strings' });
    }

    if (new Date(end_at) <= new Date(start_at)) {
      return res.status(400).json({ error: 'end_at must be later than start_at' });
    }

    const formatError = assertEnumValue(format, LESSON_FORMATS, 'format');
    if (formatError) {
      return res.status(400).json({ error: formatError });
    }

    const statusError = assertEnumValue(status, LESSON_STATUSES, 'status');
    if (statusError) {
      return res.status(400).json({ error: statusError });
    }

    const normalizedPrice = price == null || price === '' ? null : Number(price);

    if (normalizedPrice != null && (!Number.isFinite(normalizedPrice) || normalizedPrice < 0)) {
      return res.status(400).json({ error: 'price must be a non-negative number' });
    }

    const { rows } = await pool.query(
      `INSERT INTO lessons (student_id, start_at, end_at, subject, format, status, price, notes)
       VALUES ($1, $2, $3, $4, $5::lesson_format, COALESCE($6::lesson_status, 'planned'::lesson_status), $7, $8)
       RETURNING *`,
      [student_id, start_at, end_at, normalizeString(subject), format, status, normalizedPrice, normalizeString(notes)]
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

    if (!start_at || !end_at) {
      return res.status(400).json({ error: 'start_at and end_at are required' });
    }

    if (!isValidDateString(start_at) || !isValidDateString(end_at)) {
      return res.status(400).json({ error: 'start_at and end_at must be valid ISO date strings' });
    }

    if (new Date(end_at) <= new Date(start_at)) {
      return res.status(400).json({ error: 'end_at must be later than start_at' });
    }

    const formatError = assertEnumValue(format, LESSON_FORMATS, 'format');
    if (formatError) {
      return res.status(400).json({ error: formatError });
    }
    const normalizedPrice = price == null || price === '' ? null : Number(price);

    if (normalizedPrice != null && (!Number.isFinite(normalizedPrice) || normalizedPrice < 0)) {
      return res.status(400).json({ error: 'price must be a non-negative number' });
    }

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
      [start_at, end_at, normalizeString(subject), format, normalizedPrice, normalizeString(notes), id]
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
