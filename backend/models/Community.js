const mongoose = require('mongoose');

const communityPostSchema = new mongoose.Schema(
  {
    user_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    title: { type: String, required: true },
    content: { type: String, required: true },
    category: { type: String, default: 'general' },
    tags: { type: [String], default: [] },
    upvotes: { type: Number, default: 0 },
    downvotes: { type: Number, default: 0 },
    comment_count: { type: Number, default: 0 },
  },
  { timestamps: true }
);

const communityCommentSchema = new mongoose.Schema(
  {
    post_id: { type: mongoose.Schema.Types.ObjectId, ref: 'CommunityPost', required: true },
    user_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    content: { type: String, required: true },
  },
  { timestamps: true }
);

module.exports = {
  CommunityPost: mongoose.model('CommunityPost', communityPostSchema),
  CommunityComment: mongoose.model('CommunityComment', communityCommentSchema),
};
