const express = require('express');
const jwt     = require('jsonwebtoken');
const User    = require('../models/User');

const router = express.Router();
const SECRET = process.env.JWT_SECRET || 'devsecret';
const EXPIRES = process.env.JWT_EXPIRES_IN || '7d';

// POST /api/auth/register
router.post('/register', async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ error: 'Thiếu email hoặc mật khẩu' });

    const exists = await User.findOne({ email });
    if (exists) return res.status(409).json({ error: 'Email đã được đăng ký' });

    const user  = await User.create({ email, password });
    const token = jwt.sign({ id: user._id, email: user.email }, SECRET, { expiresIn: EXPIRES });
    res.status(201).json({ token, email: user.email });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// POST /api/auth/login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ error: 'Thiếu email hoặc mật khẩu' });

    const user = await User.findOne({ email });
    if (!user || !(await user.matchPassword(password)))
      return res.status(401).json({ error: 'Email hoặc mật khẩu không đúng' });

    const token = jwt.sign({ id: user._id, email: user.email }, SECRET, { expiresIn: EXPIRES });
    res.json({ token, email: user.email });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

module.exports = router;
