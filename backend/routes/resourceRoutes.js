const express = require('express');
const router = express.Router();
const Resource = require('../models/Resource');
const { protect, requireFaculty } = require('../middleware/authMiddleware');

router.get('/', protect, async (req, res) => {
  try {
    const { type, subject, search } = req.query;
    const filter = {};
    if (type && type !== 'all') filter.resource_type = type;
    if (subject && subject !== 'all') filter.subject = subject;
    if (search) {
      filter.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
      ];
    }
    const resources = await Resource.find(filter)
      .sort({ createdAt: -1 })
      .limit(50)
      .populate('user_id', 'full_name avatar_url');

    const result = resources.map((r) => {
      const obj = r.toObject();
      obj.id = obj._id.toString();
      obj.created_at = obj.createdAt;
      obj.profiles = r.user_id ? { id: r.user_id._id.toString(), full_name: r.user_id.full_name, avatar_url: r.user_id.avatar_url } : null;
      return obj;
    });
    res.json(result);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.post('/', protect, requireFaculty, async (req, res) => {
  try {
    const resource = await Resource.create({ ...req.body, user_id: req.user._id });
    const obj = resource.toObject();
    obj.id = obj._id.toString();
    obj.created_at = obj.createdAt;
    res.status(201).json(obj);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
