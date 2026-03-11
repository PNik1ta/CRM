const express = require('express');
const {
  getStudents,
  createStudent,
  getStudentById,
  updateStudent,
  getStudentLessons,
  getStudentTimeline,
} = require('../controllers/studentsController');

const router = express.Router();

router.get('/', getStudents);
router.post('/', createStudent);
router.get('/:id/lessons', getStudentLessons);
router.get('/:id/timeline', getStudentTimeline);
router.get('/:id', getStudentById);
router.patch('/:id', updateStudent);

module.exports = router;
