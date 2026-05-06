const router = require('express').Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('../config/db');
const auth = require('../middleware/auth');

const makeToken = (user) =>
  jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, { expiresIn: '7d' });

const safeUser = (u) => ({
  id: u._id, name: u.name, email: u.email,
  role: u.role, department: u.department, studentId: u.studentId,
});

// POST /api/auth/register
router.post('/register', async (req, res) => {
  try {
    const { name, email, password, role } = req.body;
    if (!name || !email || !password)
      return res.status(400).json({ message: 'All fields required' });

    const exists = await db.users.findOneAsync({ email: email.toLowerCase() });
    if (exists) return res.status(400).json({ message: 'Email already registered' });

    const passwordHash = await bcrypt.hash(password, 10);
    const user = await db.users.insertAsync({
      name, email: email.toLowerCase(), passwordHash,
      role: role || 'student',
      department: 'Computer Science Engineering',
      studentId: '',
      createdAt: new Date(),
    });
    res.status(201).json({ token: makeToken(user), user: safeUser(user) });
  } catch (err) {
    if (err.errorType === 'uniqueViolated')
      return res.status(400).json({ message: 'Email already registered' });
    res.status(500).json({ message: err.message });
  }
});

// POST /api/auth/login
router.post('/login', async (req, res) => {
  try {
    const { email, password, role } = req.body;
    if (!email || !password)
      return res.status(400).json({ message: 'Email and password required' });

    const user = await db.users.findOneAsync({ email: email.toLowerCase() });
    if (!user) return res.status(400).json({ message: 'Invalid credentials' });

    if (role && user.role !== role)
      return res.status(403).json({ message: `This account is registered as ${user.role}` });

    if (!(await bcrypt.compare(password, user.passwordHash)))
      return res.status(400).json({ message: 'Invalid credentials' });

    res.json({ token: makeToken(user), user: safeUser(user) });
  } catch (err) { res.status(500).json({ message: err.message }); }
});

// GET /api/auth/me
router.get('/me', auth, async (req, res) => {
  try {
    const user = await db.users.findOneAsync({ _id: req.user.id });
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.json(safeUser(user));
  } catch (err) { res.status(500).json({ message: err.message }); }
});

module.exports = router;
