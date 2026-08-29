const express = require('express');
const router = express.Router();
const { Quiz, QuizQuestion, QuizAttempt } = require('../models/Quiz');
const User = require('../models/User');
const { protect, requireFaculty } = require('../middleware/authMiddleware');

router.get('/', protect, async (req, res) => {
  try {
    const quizzes = await Quiz.find({ is_active: true }).sort({ createdAt: -1 });
    res.json(quizzes.map((q) => { const o = q.toObject(); o.id = o._id.toString(); o.created_at = o.createdAt; return o; }));
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.post('/', protect, requireFaculty, async (req, res) => {
  try {
    const { questions, ...quizData } = req.body;
    const quiz = await Quiz.create({ ...quizData, user_id: req.user._id });
    if (questions && questions.length > 0) {
      await QuizQuestion.insertMany(questions.map((q) => ({ ...q, quiz_id: quiz._id })));
    }
    const obj = quiz.toObject();
    obj.id = obj._id.toString();
    res.status(201).json(obj);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.get('/:id/questions', protect, async (req, res) => {
  try {
    const questions = await QuizQuestion.find({ quiz_id: req.params.id });
    res.json(questions.map((q) => { const o = q.toObject(); o.id = o._id.toString(); return o; }));
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.delete('/:id', protect, requireFaculty, async (req, res) => {
  try {
    await Quiz.findByIdAndDelete(req.params.id);
    await QuizQuestion.deleteMany({ quiz_id: req.params.id });
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET /api/quiz-attempts
router.get('/attempts/mine', protect, async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 5;
    const attempts = await QuizAttempt.find({ user_id: req.user._id })
      .sort({ createdAt: -1 })
      .limit(limit);
    res.json(attempts.map((a) => { const o = a.toObject(); o.id = o._id.toString(); o.created_at = o.createdAt; return o; }));
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.get('/attempts/count', protect, async (req, res) => {
  try {
    const count = await QuizAttempt.countDocuments();
    res.json({ count });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.post('/attempts', protect, async (req, res) => {
  try {
    const attempt = await QuizAttempt.create({ ...req.body, user_id: req.user._id });
    // Award XP
    await User.findByIdAndUpdate(req.user._id, { $inc: { xp: 10 } });
    const obj = attempt.toObject();
    obj.id = obj._id.toString();
    obj.created_at = obj.createdAt;
    res.status(201).json(obj);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
