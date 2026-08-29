const express = require('express');
const router = express.Router();
const { CommunityPost, CommunityComment } = require('../models/Community');
const { protect } = require('../middleware/authMiddleware');

router.get('/posts', protect, async (req, res) => {
  try {
    const posts = await CommunityPost.find()
      .sort({ createdAt: -1 })
      .limit(50)
      .populate('user_id', 'full_name avatar_url');
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

router.post('/posts', protect, async (req, res) => {
  try {
    const post = await CommunityPost.create({ ...req.body, user_id: req.user._id });
    const obj = post.toObject();
    obj.id = obj._id.toString();
    obj.created_at = obj.createdAt;
    res.status(201).json(obj);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.delete('/posts/:id', protect, async (req, res) => {
  try {
    await CommunityPost.findByIdAndDelete(req.params.id);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.post('/posts/:id/vote', protect, async (req, res) => {
  try {
    const { type } = req.body;
    const field = type === 'up' ? 'upvotes' : 'downvotes';
    const post = await CommunityPost.findByIdAndUpdate(
      req.params.id,
      { $inc: { [field]: 1 } },
      { new: true }
    );
    res.json({ upvotes: post.upvotes, downvotes: post.downvotes });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.get('/posts/:id/comments', protect, async (req, res) => {
  try {
    const comments = await CommunityComment.find({ post_id: req.params.id })
      .sort({ createdAt: 1 })
      .populate('user_id', 'full_name avatar_url');
    const result = comments.map((c) => {
      const o = c.toObject();
      o.id = o._id.toString();
      o.created_at = o.createdAt;
      o.profiles = c.user_id ? { id: c.user_id._id.toString(), full_name: c.user_id.full_name, avatar_url: c.user_id.avatar_url } : null;
      return o;
    });
    res.json(result);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.post('/posts/:id/comments', protect, async (req, res) => {
  try {
    const comment = await CommunityComment.create({
      post_id: req.params.id,
      user_id: req.user._id,
      content: req.body.content,
    });
    await CommunityPost.findByIdAndUpdate(req.params.id, { $inc: { comment_count: 1 } });
    const obj = comment.toObject();
    obj.id = obj._id.toString();
    obj.created_at = obj.createdAt;
    res.status(201).json(obj);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.get('/count', protect, async (req, res) => {
  try {
    const count = await CommunityPost.countDocuments();
    res.json({ count });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
