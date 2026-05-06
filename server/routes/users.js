const router = require('express').Router();
const db = require('../config/db');
const auth = require('../middleware/auth');

// GET /api/users/profile
router.get('/profile', auth, async (req, res) => {
  try {
    const user = await db.users.findOneAsync({ _id: req.user.id });
    if (!user) return res.status(404).json({ message: 'User not found' });
    const { passwordHash, ...safe } = user;
    res.json(safe);
  } catch (err) { res.status(500).json({ message: err.message }); }
});

// PUT /api/users/profile
router.put('/profile', auth, async (req, res) => {
  try {
    const { name, department, studentId } = req.body;
    await db.users.updateAsync(
      { _id: req.user.id },
      { $set: { name, department, studentId } },
      {}
    );
    const user = await db.users.findOneAsync({ _id: req.user.id });
    const { passwordHash, ...safe } = user;
    res.json(safe);
  } catch (err) { res.status(500).json({ message: err.message }); }
});

module.exports = router;
