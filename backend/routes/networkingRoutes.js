const express = require('express');
const router = express.Router();
const { MentorshipRequest, Notification } = require('../models/Misc');
const { protect } = require('../middleware/authMiddleware');

router.get('/requests', protect, async (req, res) => {
  try {
    const reqs = await MentorshipRequest.find({
      $or: [{ junior_id: req.user._id }, { senior_id: req.user._id }],
    });
    res.json(reqs.map((r) => {
      const o = r.toObject();
      o.id = o._id.toString();
      o.junior_id = o.junior_id.toString();
      o.senior_id = o.senior_id.toString();
      o.created_at = o.createdAt;
      return o;
    }));
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.get('/requests/count', protect, async (req, res) => {
  try {
    const count = await MentorshipRequest.countDocuments();
    res.json({ count });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.post('/requests', protect, async (req, res) => {
  try {
    const { senior_id, message } = req.body;
    const req_ = await MentorshipRequest.create({
      junior_id: req.user._id,
      senior_id,
      message,
    });
    // Send notification
    await Notification.create({
      user_id: senior_id,
      type: 'mentorship_request',
      title: 'New Mentorship Request',
      message: `${req.user.full_name} requested mentorship`,
    });
    const obj = req_.toObject();
    obj.id = obj._id.toString();
    res.status(201).json(obj);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.patch('/requests/:id', protect, async (req, res) => {
  try {
    const updated = await MentorshipRequest.findByIdAndUpdate(
      req.params.id,
      { status: req.body.status },
      { new: true }
    );
    res.json(updated);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
