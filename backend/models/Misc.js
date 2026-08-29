const mongoose = require('mongoose');

// Mentorship
const mentorshipSchema = new mongoose.Schema(
  {
    junior_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    senior_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    message: { type: String, default: '' },
    status: { type: String, enum: ['pending', 'accepted', 'rejected'], default: 'pending' },
  },
  { timestamps: true }
);

// Notification
const notificationSchema = new mongoose.Schema(
  {
    user_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    type: { type: String, required: true },
    title: { type: String, default: '' },
    message: { type: String, default: '' },
    link: { type: String, default: '' },
    is_read: { type: Boolean, default: false },
  },
  { timestamps: true }
);

// Roadmap Progress
const roadmapProgressSchema = new mongoose.Schema(
  {
    user_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    career_key: { type: String, required: true },
    task_id: { type: String, required: true },
    status: { type: String, enum: ['not_started', 'in_progress', 'completed'], default: 'not_started' },
  },
  { timestamps: true }
);

// Resume
const resumeSchema = new mongoose.Schema(
  {
    user_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    name: { type: String, default: 'My Resume' },
    template: { type: String, default: 'modern' },
    data: { type: mongoose.Schema.Types.Mixed, default: {} },
  },
  { timestamps: true }
);

// Career Roadmap (seed data)
const careerRoadmapSchema = new mongoose.Schema({
  career_key: { type: String, required: true, unique: true },
  career_name: { type: String, required: true },
  description: { type: String, default: '' },
  phases: { type: mongoose.Schema.Types.Mixed, default: [] },
});

// UserNote (like/save tracking)
const userNoteSchema = new mongoose.Schema(
  {
    user_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    note_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Note', required: true },
    liked: { type: Boolean, default: false },
    saved: { type: Boolean, default: false },
    rated: { type: Number, default: null },
  },
  { timestamps: true }
);

module.exports = {
  MentorshipRequest: mongoose.model('MentorshipRequest', mentorshipSchema),
  Notification: mongoose.model('Notification', notificationSchema),
  RoadmapProgress: mongoose.model('RoadmapProgress', roadmapProgressSchema),
  Resume: mongoose.model('Resume', resumeSchema),
  CareerRoadmap: mongoose.model('CareerRoadmap', careerRoadmapSchema),
  UserNote: mongoose.model('UserNote', userNoteSchema),
};
