const express = require('express');
const { getLessons, createLesson, updateLesson, deleteLesson } = require('../controllers/lessonsController');

const router = express.Router();

router.get('/', getLessons);
router.post('/', createLesson);
router.put('/:id', updateLesson);
router.delete('/:id', deleteLesson);

module.exports = router;
