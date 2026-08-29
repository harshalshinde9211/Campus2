const express = require('express');
const router = express.Router();
const User = require('../models/User');
const { protect } = require('../middleware/authMiddleware');

// GET /api/users/leaderboard
router.get('/leaderboard', protect, async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 5;
    const users = await User.find().sort({ xp: -1 }).limit(limit).select('-password');
    res.json(users.map((u) => u.toSafeObject()));
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET /api/users  (for networking - excludes self)
router.get('/', protect, async (req, res) => {
  try {
    const { branch, role, search } = req.query;
    const filter = { _id: { $ne: req.user._id } };
    if (branch && branch !== 'all') filter.branch = branch;
    if (role && role !== 'all') filter.role = role;
    if (search) {
      filter.$or = [
        { full_name: { $regex: search, $options: 'i' } },
        { skills: { $in: [new RegExp(search, 'i')] } },
      ];
    }
    const users = await User.find(filter).sort({ xp: -1 }).limit(50).select('-password');
    res.json(users.map((u) => u.toSafeObject()));
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// PATCH /api/users/me
router.patch('/me', protect, async (req, res) => {
  try {
    const allowed = [
      'full_name', 'bio', 'college', 'department', 'branch', 'semester',
      'graduation_year', 'github', 'linkedin', 'portfolio', 'skills',
      'programming_languages', 'projects', 'certifications', 'achievements',
      'avatar_url', 'xp', 'level', 'learning_streak', 'last_activity_date',
    ];
    const updates = {};
    for (const key of allowed) {
      if (req.body[key] !== undefined) updates[key] = req.body[key];
    }
    const user = await User.findByIdAndUpdate(req.user._id, updates, { new: true }).select('-password');
    res.json({ user: user.toSafeObject() });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
