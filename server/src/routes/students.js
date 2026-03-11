const express = require('express');
const {
  getStudents,
  createStudent,
  getStudentById,
  updateStudent,
} = require('../controllers/studentsController');

const router = express.Router();

router.get('/', getStudents);
router.post('/', createStudent);
router.get('/:id', getStudentById);
router.patch('/:id', updateStudent);

module.exports = router;
