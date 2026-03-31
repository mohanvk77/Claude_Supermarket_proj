const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const User = require('../models/User');
const auth = require('../middleware/auth');
const { requireRole } = require('../middleware/auth');

// GET /api/users — admin only
router.get('/', auth, requireRole('admin'), async (req, res) => {
  try {
    const users = await User.find({}, '-password').sort({ createdAt: -1 });
    res.json({ success: true, data: users });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
});

// POST /api/users — admin only
router.post('/', auth, requireRole('admin'), async (req, res) => {
  const { username, password, name, role } = req.body;
  if (!username || !password || !name || !role)
    return res.status(400).json({ success: false, message: 'All fields required' });
  if (!['admin', 'manager', 'cashier'].includes(role))
    return res.status(400).json({ success: false, message: 'Invalid role' });

  try {
    const exists = await User.findOne({ username });
    if (exists) return res.status(400).json({ success: false, message: 'Username already exists' });

    const hashedPassword = bcrypt.hashSync(password, 10);
    const user = await User.create({ username, password: hashedPassword, name, role });
    const { password: _, ...userObj } = user.toObject();
    res.status(201).json({ success: true, data: userObj });
  } catch (err) { res.status(400).json({ success: false, message: err.message }); }
});

// PUT /api/users/:id — admin only
router.put('/:id', auth, requireRole('admin'), async (req, res) => {
  const { name, role, password } = req.body;
  try {
    const update = { name, role };
    if (password) update.password = bcrypt.hashSync(password, 10);
    const user = await User.findByIdAndUpdate(req.params.id, update, { new: true }).select('-password');
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });
    res.json({ success: true, data: user });
  } catch (err) { res.status(400).json({ success: false, message: err.message }); }
});

// DELETE /api/users/:id — admin only
router.delete('/:id', auth, requireRole('admin'), async (req, res) => {
  try {
    // Prevent deleting yourself
    if (req.params.id === req.user.id.toString())
      return res.status(400).json({ success: false, message: 'Cannot delete your own account' });
    await User.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: 'User deleted' });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
});

module.exports = router;
