const jwt  = require('jsonwebtoken');
const User = require('../models/User');

// ── Helper ─────────────────────────────────────────────────────
const generateToken = (id) =>
  jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '30d' });

// ══════════════════════════════════════════════════════════════
//  POST /api/auth/signup
//  Body fields:
//    ALL ROLES   : full_name, email, password, role, phone,
//                  college, department, branch, semester,
//                  graduation_year
//    STUDENT     : student_id
//    SENIOR      : student_id, expertise
//    FACULTY     : employee_id, designation
// ══════════════════════════════════════════════════════════════
const signup = async (req, res) => {
  try {
    const {
      // required
      full_name, email, password, role,
      // common optional
      phone, college, department, branch, semester, graduation_year,
      // student / senior
      student_id, expertise,
      // faculty
      employee_id, designation,
    } = req.body;

    // ── Validate required fields ──────────────────────────────
    if (!full_name || !email || !password) {
      return res.status(400).json({ message: 'Full name, email and password are required' });
    }
    if (password.length < 6) {
      return res.status(400).json({ message: 'Password must be at least 6 characters' });
    }

    const validRoles = ['student', 'senior', 'faculty'];
    const userRole   = validRoles.includes(role) ? role : 'student';

    // ── Duplicate-email check ─────────────────────────────────
    const existing = await User.findOne({ email: email.toLowerCase().trim() });
    if (existing) {
      return res.status(409).json({ message: 'An account with this email already exists' });
    }

    // ── Build user document ───────────────────────────────────
    const userData = {
      full_name,
      email,
      password,
      role: userRole,

      // common
      phone:           phone           || '',
      college:         college         || '',
      department:      department      || '',
      branch:          branch          || '',
      semester:        semester        ? parseInt(semester)        : 1,
      graduation_year: graduation_year ? parseInt(graduation_year) : null,
    };

    // role-specific fields
    if (userRole === 'student' || userRole === 'senior') {
      userData.student_id = student_id || '';
    }
    if (userRole === 'senior') {
      userData.expertise = expertise || '';
    }
    if (userRole === 'faculty') {
      userData.employee_id = employee_id || '';
      userData.designation = designation || '';
    }

    const user  = await User.create(userData);
    const token = generateToken(user._id);

    return res.status(201).json({
      message: 'Registration successful',
      token,
      user: user.toSafeObject(),
    });
  } catch (err) {
    console.error('Signup error:', err);
    // Mongoose validation errors
    if (err.name === 'ValidationError') {
      const msg = Object.values(err.errors).map(e => e.message).join(', ');
      return res.status(400).json({ message: msg });
    }
    return res.status(500).json({ message: 'Server error during registration' });
  }
};

// ══════════════════════════════════════════════════════════════
//  POST /api/auth/login
//  Body: { email, password }
// ══════════════════════════════════════════════════════════════
const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required' });
    }

    const user = await User.findOne({ email: email.toLowerCase().trim() });
    if (!user) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    const match = await user.matchPassword(password);
    if (!match) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    const token = generateToken(user._id);
    return res.status(200).json({
      message: 'Login successful',
      token,
      user: user.toSafeObject(),
    });
  } catch (err) {
    console.error('Login error:', err);
    return res.status(500).json({ message: 'Server error during login' });
  }
};

// ══════════════════════════════════════════════════════════════
//  GET /api/auth/me   (protected — requires Bearer token)
// ══════════════════════════════════════════════════════════════
const getMe = async (req, res) => {
  try {
    return res.status(200).json({ user: req.user.toSafeObject() });
  } catch (err) {
    return res.status(500).json({ message: 'Server error' });
  }
};

module.exports = { signup, login, getMe };
