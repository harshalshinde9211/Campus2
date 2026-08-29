/**
 * ─────────────────────────────────────────────────────────────
 *  CampusSphere — User Schema
 *  Collection : users
 *  Database   : campusDB (MongoDB Atlas)
 * ─────────────────────────────────────────────────────────────
 *
 *  ROLES
 *  ─────
 *  student  — undergraduate / postgraduate student
 *  senior   — final-year student / teaching assistant
 *  faculty  — professor / administrator
 *
 *  AUTHENTICATION
 *  ──────────────
 *  • Password is bcrypt-hashed before save (salt rounds = 10)
 *  • matchPassword(plain)  → boolean
 *  • toSafeObject()        → plain object without password field
 *
 *  REGISTRATION FIELDS (captured on sign-up)
 *  ──────────────────────────────────────────
 *  All roles   : full_name, email, password, role, phone,
 *                college, department, branch, semester,
 *                graduation_year
 *  Student     : student_id  (roll number / university ID)
 *  Senior      : student_id, expertise (comma-sep skills they can mentor)
 *  Faculty     : employee_id, designation (e.g. "Associate Professor")
 *
 *  PROFILE FIELDS (editable after login)
 *  ──────────────────────────────────────
 *  bio, skills[], programming_languages[], projects[],
 *  certifications[], achievements[], github, linkedin,
 *  portfolio, avatar_url
 *
 *  GAMIFICATION
 *  ────────────
 *  xp, level, learning_streak, last_activity_date
 * ─────────────────────────────────────────────────────────────
 */

const mongoose = require('mongoose');
const bcrypt   = require('bcryptjs');

const userSchema = new mongoose.Schema(
  {
    // ── Core identity ───────────────────────────────────────
    full_name:   { type: String, required: [true, 'Full name is required'], trim: true },
    email:       { type: String, required: [true, 'Email is required'], unique: true, lowercase: true, trim: true },
    password:    { type: String, required: [true, 'Password is required'], minlength: [6, 'Password must be at least 6 characters'] },
    role:        { type: String, enum: ['student', 'senior', 'faculty'], default: 'student' },
    phone:       { type: String, default: '', trim: true },

    // ── Academic info (all roles) ────────────────────────────
    college:         { type: String, default: '', trim: true },
    department:      { type: String, default: '', trim: true },
    branch:          { type: String, default: '', trim: true },
    semester:        { type: Number, default: 1, min: 1, max: 12 },
    graduation_year: { type: Number, default: null },

    // ── Student / Senior only ────────────────────────────────
    student_id: { type: String, default: '', trim: true },   // roll number / enrolment no.
    expertise:  { type: String, default: '', trim: true },   // senior: mentorship topics

    // ── Faculty only ─────────────────────────────────────────
    employee_id:  { type: String, default: '', trim: true },
    designation:  { type: String, default: '', trim: true }, // e.g. "Associate Professor"

    // ── Profile (editable post-login) ────────────────────────
    avatar_url:            { type: String,   default: '' },
    bio:                   { type: String,   default: '', trim: true },
    skills:                { type: [String], default: [] },
    programming_languages: { type: [String], default: [] },
    projects:              { type: [String], default: [] },
    certifications:        { type: [String], default: [] },
    achievements:          { type: [String], default: [] },
    github:                { type: String,   default: '' },
    linkedin:              { type: String,   default: '' },
    portfolio:             { type: String,   default: '' },

    // ── Gamification ─────────────────────────────────────────
    xp:                 { type: Number, default: 0, min: 0 },
    level:              { type: Number, default: 1, min: 1 },
    learning_streak:    { type: Number, default: 0, min: 0 },
    last_activity_date: { type: String, default: null },
  },
  {
    timestamps: true,   // adds createdAt + updatedAt automatically
    collection: 'users',
  }
);

// ── Indexes ────────────────────────────────────────────────────
// email unique index is already created by `unique: true` in the schema above.
// Only add indexes for fields NOT already indexed in the schema definition.
userSchema.index({ role: 1 });
userSchema.index({ xp: -1 });        // leaderboard queries
userSchema.index({ branch: 1 });     // networking filters
userSchema.index({ college: 1 });

// ── Pre-save hook: hash password ───────────────────────────────
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// ── Instance method: compare plain-text password ───────────────
userSchema.methods.matchPassword = async function (entered) {
  return bcrypt.compare(entered, this.password);
};

// ── Instance method: safe object (no password, adds id alias) ──
userSchema.methods.toSafeObject = function () {
  const obj = this.toObject();
  delete obj.password;
  obj.id         = obj._id.toString();
  obj.created_at = obj.createdAt;
  obj.updated_at = obj.updatedAt;
  return obj;
};

module.exports = mongoose.model('User', userSchema);
