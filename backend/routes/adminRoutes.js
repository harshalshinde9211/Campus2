const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Note = require('../models/Note');
const { CommunityPost } = require('../models/Community');
const { Hackathon } = require('../models/Hackathon');
const { Quiz, QuizAttempt } = require('../models/Quiz');
const { HackathonRegistration } = require('../models/Hackathon');
const { MentorshipRequest, Notification } = require('../models/Misc');
const { protect, requireFaculty } = require('../middleware/authMiddleware');

router.use(protect, requireFaculty);

// Stats
router.get('/stats', async (req, res) => {
  try {
    const [users, notes, posts, quizzes, hackathons, attempts, registrations, mentorships] = await Promise.all([
      User.countDocuments(),
      Note.countDocuments({ status: 'pending' }),
      CommunityPost.countDocuments(),
      Quiz.countDocuments(),
      Hackathon.countDocuments(),
      QuizAttempt.countDocuments(),
      HackathonRegistration.countDocuments(),
      MentorshipRequest.countDocuments(),
    ]);
    res.json({ users, notes, posts, quizzes, hackathons, attempts, registrations, mentorships });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Users
router.get('/users', async (req, res) => {
  try {
    const users = await User.find().sort({ createdAt: -1 }).select('-password');
    res.json(users.map((u) => u.toSafeObject()));
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.patch('/users/:id/role', async (req, res) => {
  try {
    const user = await User.findByIdAndUpdate(req.params.id, { role: req.body.role }, { new: true }).select('-password');
    res.json(user.toSafeObject());
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Pending notes
router.get('/pending-notes', async (req, res) => {
  try {
    const notes = await Note.find({ status: 'pending' })
      .sort({ createdAt: -1 })
      .populate('user_id', 'full_name avatar_url');
    const result = notes.map((n) => {
      const o = n.toObject();
      o.id = o._id.toString();
      o.created_at = o.createdAt;
      o.profiles = n.user_id ? { id: n.user_id._id.toString(), full_name: n.user_id.full_name, avatar_url: n.user_id.avatar_url } : null;
      return o;
    });
    res.json(result);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.patch('/notes/:id/approve', async (req, res) => {
  try {
    const note = await Note.findByIdAndUpdate(req.params.id, { status: 'approved' }, { new: true });
    await Notification.create({
      user_id: note.user_id,
      type: 'note_approved',
      title: 'Your note was approved!',
      message: `"${note.title}" has been approved`,
    });
    await User.findByIdAndUpdate(note.user_id, { $inc: { xp: 20 } });
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.patch('/notes/:id/reject', async (req, res) => {
  try {
    const note = await Note.findByIdAndUpdate(req.params.id, { status: 'rejected' }, { new: true });
    await Notification.create({
      user_id: note.user_id,
      type: 'note_rejected',
      title: 'Your note was rejected',
      message: `"${note.title}" has been rejected`,
    });
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Posts, hackathons, quizzes
router.get('/posts', async (req, res) => {
  try {
    const posts = await CommunityPost.find().sort({ createdAt: -1 }).limit(20).populate('user_id', 'full_name avatar_url');
    const result = posts.map((p) => {
      const o = p.toObject();
      o.id = o._id.toString();
      o.created_at = o.createdAt;
      o.profiles = p.user_id ? { id: p.user_id._id.toString(), full_name: p.user_id.full_name, avatar_url: p.user_id.avatar_url } : null;
      return o;
    });
    res.json(result);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.get('/hackathons', async (req, res) => {
  try {
    const items = await Hackathon.find().sort({ createdAt: -1 });
    res.json(items.map((h) => { const o = h.toObject(); o.id = o._id.toString(); o.created_at = o.createdAt; return o; }));
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.get('/quizzes', async (req, res) => {
  try {
    const items = await Quiz.find().sort({ createdAt: -1 });
    res.json(items.map((q) => { const o = q.toObject(); o.id = o._id.toString(); o.created_at = o.createdAt; return o; }));
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.delete('/posts/:id', async (req, res) => {
  try {
    await CommunityPost.findByIdAndDelete(req.params.id);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.delete('/hackathons/:id', async (req, res) => {
  try {
    await Hackathon.findByIdAndDelete(req.params.id);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.delete('/quizzes/:id', async (req, res) => {
  try {
    await Quiz.findByIdAndDelete(req.params.id);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
