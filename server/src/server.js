require('dotenv').config();

const app = require('./app');
const pool = require('./db/pool');
const paymentsRoutes = require('./routes/paymentsRoutes');

const port = process.env.PORT || 3000;

async function startServer() {
  try {
    await pool.query('SELECT 1');
    // eslint-disable-next-line no-console
    console.log('Database connection established');

    app.use('/api/payments', paymentsRoutes);

    app.listen(port, () => {
      // eslint-disable-next-line no-console
      console.log(`CRM backend listening on port ${port}`);
    });
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('Failed to connect to database:', error.message);
    process.exit(1);
  }
}

startServer();
