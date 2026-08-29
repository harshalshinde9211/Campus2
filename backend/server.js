require('dotenv').config();
const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db');

connectDB();

const app = express();

app.use(cors({
  origin: [
    process.env.CLIENT_URL || 'http://localhost:5173',
    'http://localhost:5173',
    'http://localhost:4173', // vite preview
  ],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));
app.use(express.json({ limit: '10mb' }));

// Routes
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/users', require('./routes/userRoutes'));
app.use('/api/notes', require('./routes/noteRoutes'));
app.use('/api/resources', require('./routes/resourceRoutes'));
app.use('/api/doubts', require('./routes/doubtRoutes'));
app.use('/api/quizzes', require('./routes/quizRoutes'));
app.use('/api/hackathons', require('./routes/hackathonRoutes'));
app.use('/api/community', require('./routes/communityRoutes'));
app.use('/api/networking', require('./routes/networkingRoutes'));
app.use('/api/roadmaps', require('./routes/roadmapRoutes'));
app.use('/api/resumes', require('./routes/resumeRoutes'));
app.use('/api/notifications', require('./routes/notificationRoutes'));
app.use('/api/admin', require('./routes/adminRoutes'));

app.get('/api/health', (req, res) => res.json({ status: 'ok' }));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
