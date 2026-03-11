const express = require('express');
const { getLeads, createLead, convertLead } = require('../controllers/leadsController');

const router = express.Router();

router.post('/', createLead);
router.get('/', getLeads);
router.post('/:id/convert', convertLead);

module.exports = router;
