const express = require('express');
const router = express.Router();
const { Hackathon, HackathonRegistration } = require('../models/Hackathon');
const User = require('../models/User');
const { protect, requireFaculty } = require('../middleware/authMiddleware');

router.get('/', protect, async (req, res) => {
  try {
    const hackathons = await Hackathon.find().sort({ start_date: 1 });
    res.json(hackathons.map((h) => { const o = h.toObject(); o.id = o._id.toString(); o.created_at = o.createdAt; return o; }));
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.post('/', protect, requireFaculty, async (req, res) => {
  try {
    const hack = await Hackathon.create({ ...req.body, user_id: req.user._id });
    const obj = hack.toObject();
    obj.id = obj._id.toString();
    res.status(201).json(obj);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.delete('/:id', protect, requireFaculty, async (req, res) => {
  try {
    await Hackathon.findByIdAndDelete(req.params.id);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.get('/registrations/mine', protect, async (req, res) => {
  try {
    const regs = await HackathonRegistration.find({ user_id: req.user._id });
    res.json(regs.map((r) => { const o = r.toObject(); o.id = o._id.toString(); o.hackathon_id = o.hackathon_id.toString(); o.created_at = o.createdAt; return o; }));
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.get('/registrations/count', protect, async (req, res) => {
  try {
    const count = await HackathonRegistration.countDocuments();
    res.json({ count });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.post('/:id/register', protect, async (req, res) => {
  try {
    const existing = await HackathonRegistration.findOne({ hackathon_id: req.params.id, user_id: req.user._id });
    if (existing) return res.status(409).json({ message: 'Already registered' });

    await HackathonRegistration.create({ hackathon_id: req.params.id, user_id: req.user._id });
    await Hackathon.findByIdAndUpdate(req.params.id, { $inc: { registration_count: 1 } });
    await User.findByIdAndUpdate(req.user._id, { $inc: { xp: 50 } });
    res.status(201).json({ success: true });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
