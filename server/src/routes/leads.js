const express = require('express');
const { getLeads, createLead } = require('../controllers/leadsController');

const router = express.Router();

router.post('/', createLead);
router.get('/', getLeads);

module.exports = router;
