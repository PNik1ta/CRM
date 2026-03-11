const express = require('express');
const { createPayment, getStudentPayments } = require('../controllers/paymentsController');

const router = express.Router();

router.post('/', createPayment);
router.get('/student/:id', getStudentPayments);

module.exports = router;
