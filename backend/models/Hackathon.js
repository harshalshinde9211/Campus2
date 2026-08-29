const mongoose = require('mongoose');

const hackathonSchema = new mongoose.Schema(
  {
    user_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    title: { type: String, required: true },
    description: { type: String, default: '' },
    organizer: { type: String, default: '' },
    start_date: { type: String, required: true },
    end_date: { type: String, required: true },
    location: { type: String, default: 'Online' },
    website_url: { type: String, default: '' },
    prize: { type: String, default: '' },
    tags: { type: [String], default: [] },
    max_team_size: { type: Number, default: 4 },
    registration_count: { type: Number, default: 0 },
  },
  { timestamps: true }
);

const hackathonRegistrationSchema = new mongoose.Schema(
  {
    hackathon_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Hackathon', required: true },
    user_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    team_name: { type: String, default: '' },
  },
  { timestamps: true }
);

module.exports = {
  Hackathon: mongoose.model('Hackathon', hackathonSchema),
  HackathonRegistration: mongoose.model('HackathonRegistration', hackathonRegistrationSchema),
};
