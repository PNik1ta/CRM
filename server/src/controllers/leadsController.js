const pool = require('../db/pool');

async function getLeads(req, res, next) {
  try {
    const { rows } = await pool.query('SELECT * FROM leads ORDER BY created_at DESC');
    res.json(rows);
  } catch (error) {
    next(error);
  }
}

async function createLead(req, res, next) {
  try {
    const { name, phone, email, message, source, status } = req.body;

    const { rows } = await pool.query(
      `INSERT INTO leads (name, phone, email, message, source, status)
       VALUES ($1, $2, $3, $4, $5, COALESCE($6, 'new'))
       RETURNING *`,
      [name, phone, email, message, source, status]
    );

    res.status(201).json(rows[0]);
  } catch (error) {
    next(error);
  }
}

async function convertLead(req, res, next) {
  const client = await pool.connect();

  try {
    const { id } = req.params;

    await client.query('BEGIN');

    const leadResult = await client.query('SELECT * FROM leads WHERE id = $1 FOR UPDATE', [id]);

    if (leadResult.rows.length === 0) {
      await client.query('ROLLBACK');
      return res.status(404).json({ error: 'Lead not found' });
    }

    const lead = leadResult.rows[0];

    if (lead.status === 'converted') {
      await client.query('ROLLBACK');
      return res.status(400).json({ error: 'Lead already converted' });
    }

    const studentResult = await client.query(
      `INSERT INTO students (first_name, phone, email)
       VALUES ($1, $2, $3)
       RETURNING *`,
      [lead.name, lead.phone, lead.email]
    );

    const student = studentResult.rows[0];

    const updatedLeadResult = await client.query(
      `UPDATE leads
       SET status = 'converted', student_id = $2
       WHERE id = $1
       RETURNING *`,
      [lead.id, student.id]
    );

    await client.query('COMMIT');

    return res.json({
      lead: updatedLeadResult.rows[0],
      student,
    });
  } catch (error) {
    await client.query('ROLLBACK');
    return next(error);
  } finally {
    client.release();
  }
}

module.exports = {
  getLeads,
  createLead,
  convertLead,
};
