const pool = require('../db/pool');

async function getStudents(req, res, next) {
  try {
    const { rows } = await pool.query(
      'SELECT * FROM students ORDER BY created_at DESC'
    );
    res.json(rows);
  } catch (error) {
    next(error);
  }
}

async function createStudent(req, res, next) {
  try {
    const { first_name, last_name, phone, email, parent_name, notes, status } = req.body;

    const { rows } = await pool.query(
      `INSERT INTO students (first_name, last_name, phone, email, parent_name, notes, status)
       VALUES ($1, $2, $3, $4, $5, $6, COALESCE($7, 'active'))
       RETURNING *`,
      [first_name, last_name, phone, email, parent_name, notes, status]
    );

    res.status(201).json(rows[0]);
  } catch (error) {
    next(error);
  }
}

async function getStudentById(req, res, next) {
  try {
    const { id } = req.params;
    const { rows } = await pool.query('SELECT * FROM students WHERE id = $1', [id]);

    if (!rows.length) {
      return res.status(404).json({ error: 'Student not found' });
    }

    return res.json(rows[0]);
  } catch (error) {
    return next(error);
  }
}

async function updateStudent(req, res, next) {
  try {
    const { id } = req.params;
    const { first_name, last_name, phone, email, parent_name, notes, status } = req.body;

    const { rows } = await pool.query(
      `UPDATE students
       SET first_name = COALESCE($1, first_name),
           last_name = COALESCE($2, last_name),
           phone = COALESCE($3, phone),
           email = COALESCE($4, email),
           parent_name = COALESCE($5, parent_name),
           notes = COALESCE($6, notes),
           status = COALESCE($7, status)
       WHERE id = $8
       RETURNING *`,
      [first_name, last_name, phone, email, parent_name, notes, status, id]
    );

    if (!rows.length) {
      return res.status(404).json({ error: 'Student not found' });
    }

    return res.json(rows[0]);
  } catch (error) {
    return next(error);
  }
}

module.exports = {
  getStudents,
  createStudent,
  getStudentById,
  updateStudent,
};
