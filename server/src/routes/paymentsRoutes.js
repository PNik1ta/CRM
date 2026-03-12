const express = require('express');
const {
  createPayment,
  getStudentPayments,
  updatePayment,
  deletePayment,
} = require('../controllers/paymentsController');

const router = express.Router();

router.post('/', createPayment);
router.get('/student/:id', getStudentPayments);
router.put('/:id', updatePayment);
router.delete('/:id', deletePayment);

module.exports = router;
