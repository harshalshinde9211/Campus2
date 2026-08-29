const mongoose = require('mongoose');

const doubtSchema = new mongoose.Schema(
  {
    user_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    title: { type: String, required: true },
    description: { type: String, default: '' },
    image_url: { type: String, default: '' },
    subject: { type: String, default: '' },
    topic: { type: String, default: '' },
    tags: { type: [String], default: [] },
    views: { type: Number, default: 0 },
    upvotes: { type: Number, default: 0 },
    downvotes: { type: Number, default: 0 },
    answer_count: { type: Number, default: 0 },
    best_answer_id: { type: mongoose.Schema.Types.ObjectId, default: null },
  },
  { timestamps: true }
);

const doubtAnswerSchema = new mongoose.Schema(
  {
    doubt_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Doubt', required: true },
    user_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    content: { type: String, required: true },
    upvotes: { type: Number, default: 0 },
    downvotes: { type: Number, default: 0 },
    is_best: { type: Boolean, default: false },
  },
  { timestamps: true }
);

module.exports = {
  Doubt: mongoose.model('Doubt', doubtSchema),
  DoubtAnswer: mongoose.model('DoubtAnswer', doubtAnswerSchema),
};
