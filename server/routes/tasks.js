const router = require('express').Router();
const db = require('../config/db');
const auth = require('../middleware/auth');

// GET /api/tasks
router.get('/', auth, async (req, res) => {
  try {
    let tasks;
    if (req.user.role === 'instructor') {
      tasks = await db.tasks.findAsync({ createdBy: req.user.id });
    } else {
      tasks = await db.tasks.findAsync({ assignedTo: req.user.id });
    }
    tasks.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    // Shape to match frontend: wrap createdByName into createdBy object
    const result = tasks.map(t => ({
      ...t,
      createdBy: { name: t.createdByName || '' },
    }));
    res.json(result);
  } catch (err) { res.status(500).json({ message: err.message }); }
});

// POST /api/tasks
router.post('/', auth, async (req, res) => {
  try {
    if (req.user.role !== 'instructor')
      return res.status(403).json({ message: 'Instructors only' });
    const { title, subject, description, dueDate, priority, assignedTo } = req.body;
    if (!title) return res.status(400).json({ message: 'Title required' });

    const creator = await db.users.findOneAsync({ _id: req.user.id });
    const task = await db.tasks.insertAsync({
      title, subject: subject || '', description: description || '',
      dueDate: dueDate || null, priority: priority || 'medium',
      status: 'pending',
      assignedTo: assignedTo || [],
      createdBy: req.user.id,
      createdByName: creator?.name || 'Instructor',
      createdAt: new Date(),
    });
    res.status(201).json(task);
  } catch (err) { res.status(500).json({ message: err.message }); }
});

// PUT /api/tasks/:id
router.put('/:id', auth, async (req, res) => {
  try {
    const task = await db.tasks.findOneAsync({ _id: req.params.id });
    if (!task) return res.status(404).json({ message: 'Task not found' });

    const update = req.user.role === 'student'
      ? { $set: { status: req.body.status || task.status } }
      : { $set: req.body };

    await db.tasks.updateAsync({ _id: req.params.id }, update, {});
    const updated = await db.tasks.findOneAsync({ _id: req.params.id });
    res.json({ ...updated, createdBy: { name: updated.createdByName || '' } });
  } catch (err) { res.status(500).json({ message: err.message }); }
});

// DELETE /api/tasks/:id
router.delete('/:id', auth, async (req, res) => {
  try {
    if (req.user.role !== 'instructor')
      return res.status(403).json({ message: 'Instructors only' });
    await db.tasks.removeAsync({ _id: req.params.id }, {});
    res.json({ message: 'Task deleted' });
  } catch (err) { res.status(500).json({ message: err.message }); }
});

module.exports = router;
