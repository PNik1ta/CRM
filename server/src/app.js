const cors = require('cors');
const express = require('express');
const morgan = require('morgan');

const studentsRoutes = require('./routes/students');
const lessonsRoutes = require('./routes/lessons');
const paymentsRoutes = require('./routes/paymentsRoutes');
const leadsRoutes = require('./routes/leads');

const app = express();

app.use(cors());
app.use(morgan('dev'));
app.use(express.json());

app.get('/health', (req, res) => {
  res.json({ ok: true });
});

app.use('/api/students', studentsRoutes);
app.use('/api/lessons', lessonsRoutes);
app.use('/api/payments', paymentsRoutes);
app.use('/api/leads', leadsRoutes);

app.use((req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

app.use((err, req, res, next) => {
  // eslint-disable-next-line no-console
  console.error(err);

  if (res.headersSent) {
    return next(err);
  }

  return res.status(500).json({
    error: 'Internal server error',
    message: err.message,
  });
});

module.exports = app;
