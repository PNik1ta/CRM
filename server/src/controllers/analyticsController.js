const pool = require('../db/pool');

function isDateString(value) {
  return /^\d{4}-\d{2}-\d{2}$/.test(value);
}

function normalizeSeries(rows, valueKey) {
  return rows.map((row) => ({
    date: row.date,
    value: Number(row[valueKey]),
  }));
}

async function getAnalytics(req, res, next) {
  try {
    const { from, to } = req.query;

    if (!isDateString(from) || !isDateString(to)) {
      return res.status(400).json({ error: 'from and to must be YYYY-MM-DD' });
    }

    if (from > to) {
      return res.status(400).json({ error: 'from must be less than or equal to to' });
    }

    const [revenueResult, lessonsResult, studentsResult] = await Promise.all([
      pool.query(
        `SELECT paid_at::date AS date, COALESCE(SUM(amount), 0) AS value
         FROM payments
         WHERE status = 'received'::payment_status
           AND paid_at::date BETWEEN $1::date AND $2::date
         GROUP BY paid_at::date
         ORDER BY paid_at::date`,
        [from, to]
      ),
      pool.query(
        `SELECT start_at::date AS date, COUNT(*)::int AS value
         FROM lessons
         WHERE start_at::date BETWEEN $1::date AND $2::date
         GROUP BY start_at::date
         ORDER BY start_at::date`,
        [from, to]
      ),
      pool.query(
        `SELECT created_at::date AS date, COUNT(*)::int AS value
         FROM students
         WHERE created_at::date BETWEEN $1::date AND $2::date
         GROUP BY created_at::date
         ORDER BY created_at::date`,
        [from, to]
      ),
    ]);

    return res.json({
      revenue: normalizeSeries(revenueResult.rows, 'value'),
      lessons: normalizeSeries(lessonsResult.rows, 'value'),
      students: normalizeSeries(studentsResult.rows, 'value'),
    });
  } catch (error) {
    return next(error);
  }
}

module.exports = {
  getAnalytics,
};
