const express = require('express');
const router = express.Router();
const { RoadmapProgress, CareerRoadmap } = require('../models/Misc');
const User = require('../models/User');
const { protect } = require('../middleware/authMiddleware');

router.get('/', protect, async (req, res) => {
  try {
    const roadmaps = await CareerRoadmap.find().sort({ career_name: 1 });
    res.json(roadmaps.map((r) => { const o = r.toObject(); o.id = o._id.toString(); return o; }));
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.get('/progress', protect, async (req, res) => {
  try {
    const { careerKey } = req.query;
    const filter = { user_id: req.user._id };
    if (careerKey) filter.career_key = careerKey;
    const progress = await RoadmapProgress.find(filter);
    res.json(progress.map((p) => { const o = p.toObject(); o.id = o._id.toString(); o.updated_at = o.updatedAt; return o; }));
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.post('/progress', protect, async (req, res) => {
  try {
    const { career_key, task_id, status } = req.body;
    const existing = await RoadmapProgress.findOne({ user_id: req.user._id, career_key, task_id });
    let prog;
    if (existing) {
      existing.status = status;
      prog = await existing.save();
    } else {
      prog = await RoadmapProgress.create({ user_id: req.user._id, career_key, task_id, status });
    }
    if (status === 'completed') {
      await User.findByIdAndUpdate(req.user._id, { $inc: { xp: 15 } });
    }
    const obj = prog.toObject();
    obj.id = obj._id.toString();
    res.status(201).json(obj);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
