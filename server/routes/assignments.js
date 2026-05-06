const router = require('express').Router();
const db = require('../config/db');
const auth = require('../middleware/auth');
const upload = require('../middleware/upload');

// GET /api/assignments
router.get('/', auth, async (req, res) => {
  try {
    let assignments;
    if (req.user.role === 'instructor') {
      assignments = await db.assignments.findAsync({});
      // attach submitter names
      const userIds = [...new Set(assignments.map(a => a.submittedBy))];
      const users = await db.users.findAsync({ _id: { $in: userIds } });
      const userMap = Object.fromEntries(users.map(u => [u._id, u.name]));
      assignments = assignments.map(a => ({
        ...a, submittedBy: { _id: a.submittedBy, name: userMap[a.submittedBy] || '' },
      }));
    } else {
      assignments = await db.assignments.findAsync({ submittedBy: req.user.id });
    }
    assignments.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    res.json(assignments);
  } catch (err) { res.status(500).json({ message: err.message }); }
});

// POST /api/assignments/upload
router.post('/upload', auth, upload.single('file'), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ message: 'No file uploaded' });
    const { subject, taskId } = req.body;
    
    // Save assignment
    const assignment = await db.assignments.insertAsync({
      originalName: req.file.originalname,
      filename: req.file.filename,
      fileSize: req.file.size,
      fileUrl: `/uploads/${req.file.filename}`,
      subject: subject || '',
      taskId: taskId || null,
      submittedBy: req.user.id,
      status: 'submitted',
      grade: '', feedback: '',
      createdAt: new Date(),
    });

    // Automatically mark the task as done if taskId was provided
    if (taskId) {
        await db.tasks.updateAsync({ _id: taskId }, { $set: { status: 'done' } });
    }

    res.status(201).json(assignment);
  } catch (err) { res.status(500).json({ message: err.message }); }
});

// PUT /api/assignments/:id/grade
router.put('/:id/grade', auth, async (req, res) => {
  try {
    if (req.user.role !== 'instructor')
      return res.status(403).json({ message: 'Instructors only' });
    await db.assignments.updateAsync(
      { _id: req.params.id },
      { $set: { status: 'graded', grade: req.body.grade, feedback: req.body.feedback } }, {}
    );
    const updated = await db.assignments.findOneAsync({ _id: req.params.id });
    res.json(updated);
  } catch (err) { res.status(500).json({ message: err.message }); }
});

// DELETE /api/assignments/:id
router.delete('/:id', auth, async (req, res) => {
  try {
    const a = await db.assignments.findOneAsync({ _id: req.params.id });
    if (!a) return res.status(404).json({ message: 'Not found' });
    if (a.submittedBy !== req.user.id && req.user.role !== 'instructor')
      return res.status(403).json({ message: 'Not authorized' });
    await db.assignments.removeAsync({ _id: req.params.id }, {});
    res.json({ message: 'Deleted' });
  } catch (err) { res.status(500).json({ message: err.message }); }
});

module.exports = router;
