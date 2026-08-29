const express = require('express');
const router = express.Router();
const Note = require('../models/Note');
const { UserNote } = require('../models/Misc');
const { protect } = require('../middleware/authMiddleware');

// GET /api/notes
router.get('/', protect, async (req, res) => {
  try {
    const { branch, subject, search, sortBy, userId, limit = 50 } = req.query;
    const filter = {};
    if (userId) {
      filter.user_id = userId;
    } else {
      filter.status = 'approved';
    }
    if (branch && branch !== 'all') filter.branch = branch;
    if (subject && subject !== 'all') filter.subject = subject;
    if (search) {
      filter.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
      ];
    }

    let sort = { createdAt: -1 };
    if (sortBy === 'downloads') sort = { downloads: -1 };
    else if (sortBy === 'likes') sort = { likes: -1 };
    else if (sortBy === 'rating') sort = { rating_sum: -1 };

    const notes = await Note.find(filter)
      .sort(sort)
      .limit(parseInt(limit))
      .populate('user_id', 'full_name avatar_url branch semester');

    const result = notes.map((n) => {
      const obj = n.toObject();
      obj.id = obj._id.toString();
      obj.created_at = obj.createdAt;
      obj.updated_at = obj.updatedAt;
      obj.profiles = n.user_id
        ? {
            id: n.user_id._id.toString(),
            full_name: n.user_id.full_name,
            avatar_url: n.user_id.avatar_url,
            branch: n.user_id.branch,
            semester: n.user_id.semester,
          }
        : null;
      return obj;
    });
    res.json(result);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// POST /api/notes
router.post('/', protect, async (req, res) => {
  try {
    const note = await Note.create({ ...req.body, user_id: req.user._id });
    const obj = note.toObject();
    obj.id = obj._id.toString();
    obj.created_at = obj.createdAt;
    res.status(201).json(obj);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// POST /api/notes/:id/like
router.post('/:id/like', protect, async (req, res) => {
  try {
    const note = await Note.findById(req.params.id);
    if (!note) return res.status(404).json({ message: 'Note not found' });

    let userNote = await UserNote.findOne({ user_id: req.user._id, note_id: note._id });
    if (userNote) {
      userNote.liked = !userNote.liked;
      await userNote.save();
      note.likes += userNote.liked ? 1 : -1;
    } else {
      await UserNote.create({ user_id: req.user._id, note_id: note._id, liked: true });
      note.likes += 1;
    }
    await note.save();
    res.json({ likes: note.likes });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// POST /api/notes/:id/download
router.post('/:id/download', protect, async (req, res) => {
  try {
    const note = await Note.findByIdAndUpdate(
      req.params.id,
      { $inc: { downloads: 1 } },
      { new: true }
    );
    res.json({ downloads: note.downloads });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
