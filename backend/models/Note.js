const mongoose = require('mongoose');

const noteSchema = new mongoose.Schema(
  {
    user_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    title: { type: String, required: true },
    description: { type: String, default: '' },
    file_url: { type: String, default: '' },
    file_type: { type: String, default: '' },
    file_name: { type: String, default: '' },
    file_size: { type: Number, default: 0 },
    subject: { type: String, required: true },
    branch: { type: String, default: '' },
    semester: { type: Number, default: null },
    department: { type: String, default: '' },
    tags: { type: [String], default: [] },
    status: { type: String, enum: ['pending', 'approved', 'rejected'], default: 'pending' },
    rejection_reason: { type: String, default: '' },
    views: { type: Number, default: 0 },
    downloads: { type: Number, default: 0 },
    likes: { type: Number, default: 0 },
    saves: { type: Number, default: 0 },
    rating_sum: { type: Number, default: 0 },
    rating_count: { type: Number, default: 0 },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Note', noteSchema);
