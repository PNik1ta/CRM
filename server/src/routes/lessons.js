const express = require('express');
const { getLessons, createLesson, deleteLesson } = require('../controllers/lessonsController');

const router = express.Router();

router.get('/', getLessons);
router.post('/', createLesson);
router.delete('/:id', deleteLesson);

module.exports = router;
