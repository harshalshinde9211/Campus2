const express = require('express');
const router = express.Router();
const { Notification } = require('../models/Misc');
const { protect } = require('../middleware/authMiddleware');

router.get('/', protect, async (req, res) => {
  try {
    const { type } = req.query;
    const filter = { user_id: req.user._id };
    if (type) filter.type = type;
    const notifications = await Notification.find(filter)
      .sort({ createdAt: -1 })
      .limit(20);
    res.json(notifications.map((n) => { const o = n.toObject(); o.id = o._id.toString(); o.created_at = o.createdAt; return o; }));
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.post('/', protect, async (req, res) => {
  try {
    const notif = await Notification.create({ ...req.body, user_id: req.user._id });
    const obj = notif.toObject();
    obj.id = obj._id.toString();
    obj.created_at = obj.createdAt;
    res.status(201).json(obj);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.patch('/mark-all-read', protect, async (req, res) => {
  try {
    await Notification.updateMany({ user_id: req.user._id, is_read: false }, { is_read: true });
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
