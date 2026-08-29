const mongoose = require('mongoose');

const quizSchema = new mongoose.Schema(
  {
    user_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    title: { type: String, required: true },
    description: { type: String, default: '' },
    subject: { type: String, required: true },
    topic: { type: String, default: '' },
    difficulty: { type: String, enum: ['easy', 'medium', 'hard'], default: 'medium' },
    duration_minutes: { type: Number, default: 30 },
    is_active: { type: Boolean, default: true },
  },
  { timestamps: true }
);

const quizQuestionSchema = new mongoose.Schema({
  quiz_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Quiz', required: true },
  question: { type: String, required: true },
  options: { type: [String], required: true },
  correct_index: { type: Number, required: true },
  explanation: { type: String, default: '' },
});

const quizAttemptSchema = new mongoose.Schema(
  {
    quiz_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Quiz', required: true },
    user_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    score: { type: Number, required: true },
    total_questions: { type: Number, required: true },
    percentage: { type: Number, required: true },
    time_spent_seconds: { type: Number, default: 0 },
    answers: { type: [Number], default: [] },
  },
  { timestamps: true }
);

module.exports = {
  Quiz: mongoose.model('Quiz', quizSchema),
  QuizQuestion: mongoose.model('QuizQuestion', quizQuestionSchema),
  QuizAttempt: mongoose.model('QuizAttempt', quizAttemptSchema),
};
