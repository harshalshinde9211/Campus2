const mongoose = require('mongoose');

const resourceSchema = new mongoose.Schema(
  {
    user_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    title: { type: String, required: true },
    description: { type: String, default: '' },
    resource_type: { type: String, default: 'chapter_notes' },
    subject: { type: String, required: true },
    branch: { type: String, default: '' },
    semester: { type: Number, default: null },
    department: { type: String, default: '' },
    file_url: { type: String, default: '' },
    external_url: { type: String, default: '' },
    tags: { type: [String], default: [] },
    views: { type: Number, default: 0 },
    downloads: { type: Number, default: 0 },
    rating_sum: { type: Number, default: 0 },
    rating_count: { type: Number, default: 0 },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Resource', resourceSchema);
