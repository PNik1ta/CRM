const express = require('express');
const { getPayments, createPayment } = require('../controllers/paymentsController');

const router = express.Router();

router.get('/', getPayments);
router.post('/', createPayment);

module.exports = router;
