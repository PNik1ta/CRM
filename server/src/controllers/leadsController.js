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

module.exports = {
  getLeads,
  createLead,
};
