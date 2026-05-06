const router = require('express').Router();
const db = require('../config/db');
const auth = require('../middleware/auth');

// GET /api/projects
router.get('/', auth, async (req, res) => {
  try {
    const all = await db.projects.findAsync({
      $or: [{ createdBy: req.user.id }, { members: req.user.id }]
    });
    all.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    // Attach member names
    const allUserIds = [...new Set(all.flatMap(p => p.members || []))];
    const users = await db.users.findAsync({ _id: { $in: allUserIds } });
    const userMap = Object.fromEntries(users.map(u => [u._id, { _id: u._id, name: u.name, email: u.email }]));

    const result = all.map(p => ({
      ...p,
      members: (p.members || []).map(id => userMap[id] || { _id: id, name: id }),
    }));
    res.json(result);
  } catch (err) { res.status(500).json({ message: err.message }); }
});

// POST /api/projects
router.post('/', auth, async (req, res) => {
  try {
    const { name, emoji, description, dueDate, status, progress } = req.body;
    if (!name) return res.status(400).json({ message: 'Name required' });
    const project = await db.projects.insertAsync({
      name, emoji: emoji || '🗂️',
      description: description || '',
      dueDate: dueDate || null,
      status: status || 'in_progress',
      members: [req.user.id],
      progress: progress || 0,
      createdBy: req.user.id,
      createdAt: new Date(),
    });
    res.status(201).json(project);
  } catch (err) { res.status(500).json({ message: err.message }); }
});

// PUT /api/projects/:id
router.put('/:id', auth, async (req, res) => {
  try {
    await db.projects.updateAsync({ _id: req.params.id }, { $set: req.body }, {});
    const updated = await db.projects.findOneAsync({ _id: req.params.id });
    if (!updated) return res.status(404).json({ message: 'Not found' });
    res.json(updated);
  } catch (err) { res.status(500).json({ message: err.message }); }
});

// DELETE /api/projects/:id
router.delete('/:id', auth, async (req, res) => {
  try {
    await db.projects.removeAsync({ _id: req.params.id }, {});
    res.json({ message: 'Deleted' });
  } catch (err) { res.status(500).json({ message: err.message }); }
});

module.exports = router;
