const express = require('express');
const router = express.Router();
const { Resume } = require('../models/Misc');
const { protect } = require('../middleware/authMiddleware');

router.get('/', protect, async (req, res) => {
  try {
    const resumes = await Resume.find({ user_id: req.user._id }).sort({ updatedAt: -1 });
    res.json(resumes.map((r) => { const o = r.toObject(); o.id = o._id.toString(); o.created_at = o.createdAt; o.updated_at = o.updatedAt; return o; }));
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.post('/', protect, async (req, res) => {
  try {
    const resume = await Resume.create({ ...req.body, user_id: req.user._id });
    const obj = resume.toObject();
    obj.id = obj._id.toString();
    obj.created_at = obj.createdAt;
    obj.updated_at = obj.updatedAt;
    res.status(201).json(obj);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.patch('/:id', protect, async (req, res) => {
  try {
    const resume = await Resume.findOneAndUpdate(
      { _id: req.params.id, user_id: req.user._id },
      req.body,
      { new: true }
    );
    const obj = resume.toObject();
    obj.id = obj._id.toString();
    obj.updated_at = obj.updatedAt;
    res.json(obj);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.delete('/:id', protect, async (req, res) => {
  try {
    await Resume.findOneAndDelete({ _id: req.params.id, user_id: req.user._id });
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
