const express = require('express');
const router = express.Router();
const { Doubt, DoubtAnswer } = require('../models/Doubt');
const { protect } = require('../middleware/authMiddleware');

const populateUser = 'full_name avatar_url role';

router.get('/', protect, async (req, res) => {
  try {
    const { subject, search } = req.query;
    const filter = {};
    if (subject && subject !== 'all') filter.subject = subject;
    if (search) {
      filter.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
      ];
    }
    const doubts = await Doubt.find(filter)
      .sort({ createdAt: -1 })
      .limit(50)
      .populate('user_id', populateUser);

    const result = doubts.map((d) => {
      const obj = d.toObject();
      obj.id = obj._id.toString();
      obj.created_at = obj.createdAt;
      obj.profiles = d.user_id ? { id: d.user_id._id.toString(), full_name: d.user_id.full_name, avatar_url: d.user_id.avatar_url, role: d.user_id.role } : null;
      return obj;
    });
    res.json(result);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.post('/', protect, async (req, res) => {
  try {
    const doubt = await Doubt.create({ ...req.body, user_id: req.user._id });
    const obj = doubt.toObject();
    obj.id = obj._id.toString();
    obj.created_at = obj.createdAt;
    res.status(201).json(obj);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.patch('/:id', protect, async (req, res) => {
  try {
    const doubt = await Doubt.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(doubt);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.get('/:id/answers', protect, async (req, res) => {
  try {
    const answers = await DoubtAnswer.find({ doubt_id: req.params.id })
      .sort({ is_best: -1, createdAt: 1 })
      .populate('user_id', populateUser);

    const result = answers.map((a) => {
      const obj = a.toObject();
      obj.id = obj._id.toString();
      obj.created_at = obj.createdAt;
      obj.profiles = a.user_id ? { id: a.user_id._id.toString(), full_name: a.user_id.full_name, avatar_url: a.user_id.avatar_url, role: a.user_id.role } : null;
      return obj;
    });
    res.json(result);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.post('/:id/answers', protect, async (req, res) => {
  try {
    const answer = await DoubtAnswer.create({
      doubt_id: req.params.id,
      user_id: req.user._id,
      content: req.body.content,
    });
    await Doubt.findByIdAndUpdate(req.params.id, { $inc: { answer_count: 1 } });
    const obj = answer.toObject();
    obj.id = obj._id.toString();
    obj.created_at = obj.createdAt;
    res.status(201).json(obj);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.patch('/answers/:id', protect, async (req, res) => {
  try {
    const answer = await DoubtAnswer.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(answer);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Mark best answer
router.post('/:doubtId/answers/:answerId/best', protect, async (req, res) => {
  try {
    await DoubtAnswer.updateMany({ doubt_id: req.params.doubtId }, { is_best: false });
    await DoubtAnswer.findByIdAndUpdate(req.params.answerId, { is_best: true });
    await Doubt.findByIdAndUpdate(req.params.doubtId, { best_answer_id: req.params.answerId });
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
