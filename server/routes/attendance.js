const router = require('express').Router();
const db = require('../config/db');
const auth = require('../middleware/auth');

// GET /api/attendance/students
router.get('/students', auth, async (req, res) => {
  try {
    if (req.user.role !== 'instructor')
      return res.status(403).json({ message: 'Instructors only' });
    const students = await db.users.findAsync({ role: 'student' });
    res.json(students.map(s => ({ _id: s._id, name: s.name, email: s.email, department: s.department, studentId: s.studentId })));
  } catch (err) { res.status(500).json({ message: err.message }); }
});

// GET /api/attendance
router.get('/', auth, async (req, res) => {
  try {
    const records = await db.attendance.findAsync({});
    records.sort((a, b) => new Date(b.date) - new Date(a.date));
    res.json(records);
  } catch (err) { res.status(500).json({ message: err.message }); }
});

// POST /api/attendance
router.post('/', auth, async (req, res) => {
  try {
    if (req.user.role !== 'instructor')
      return res.status(403).json({ message: 'Instructors only' });
    const { date, course, students } = req.body;

    // Upsert: remove existing record for same date+course then insert
    await db.attendance.removeAsync({ date, course }, {});
    const record = await db.attendance.insertAsync({
      date, course, students,
      markedBy: req.user.id,
      createdAt: new Date(),
    });
    res.status(201).json(record);
  } catch (err) { res.status(500).json({ message: err.message }); }
});

module.exports = router;
