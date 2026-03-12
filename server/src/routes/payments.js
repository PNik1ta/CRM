const express = require('express');
const { createPayment, getStudentPayments, deletePayment } = require('../controllers/paymentsController');

const router = express.Router();

router.post('/', createPayment);
router.get('/student/:id', getStudentPayments);
router.delete('/:id', deletePayment);

module.exports = router;
