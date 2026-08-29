/**
 * CampusSphere — Full Database Seed Script
 * Run: node seed.js   (from inside the backend/ folder)
 *
 * Safe to run multiple times — clears seed data first, then re-inserts.
 * Does NOT delete users you created via the UI (emails not in seedEmails set).
 */

require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const dns = require('dns');

dns.setDefaultResultOrder('ipv4first');
dns.setServers(['8.8.8.8', '8.8.4.4']);

// ─── Models ────────────────────────────────────────────────────────────────
const User = require('./models/User');
const Note = require('./models/Note');
const Resource = require('./models/Resource');
const { Doubt, DoubtAnswer } = require('./models/Doubt');
const { Quiz, QuizQuestion, QuizAttempt } = require('./models/Quiz');
const { Hackathon, HackathonRegistration } = require('./models/Hackathon');
const { CommunityPost, CommunityComment } = require('./models/Community');
const {
  MentorshipRequest,
  Notification,
  RoadmapProgress,
  Resume,
  CareerRoadmap,
  UserNote,
} = require('./models/Misc');

// ─── Helpers ────────────────────────────────────────────────────────────────
const pick = (arr) => arr[Math.floor(Math.random() * arr.length)];
const rand = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;
const daysAgo = (n) => new Date(Date.now() - n * 86400000).toISOString();
const daysFromNow = (n) => new Date(Date.now() + n * 86400000).toISOString();

const BRANCHES = [
  'Computer Science', 'Information Technology',
  'Electronics & Communication', 'Electrical',
  'Mechanical', 'Civil',
];
const DEPARTMENTS = ['Engineering', 'Science', 'Management'];
const SUBJECTS = [
  'Data Structures', 'Algorithms', 'Operating Systems',
  'Database Management', 'Computer Networks', 'Software Engineering',
  'Web Development', 'Machine Learning', 'Artificial Intelligence',
  'Cloud Computing', 'Cybersecurity', 'Mobile Development',
  'Mathematics', 'Physics', 'Digital Logic Design',
];
const SKILLS_POOL = [
  'React', 'Node.js', 'Python', 'Java', 'C++', 'MongoDB',
  'Express.js', 'TypeScript', 'Docker', 'AWS', 'Git', 'REST APIs',
  'GraphQL', 'Redux', 'Next.js', 'Flutter', 'Django', 'Spring Boot',
];
const COLLEGES = [
  'MIT College of Engineering',
  'VIT University',
  'BITS Pilani',
  'NIT Trichy',
  'Pune Institute of Computer Technology',
];

// ─── Seed emails (used to delete & re-insert cleanly) ───────────────────────
const SEED_EMAILS = new Set([
  // faculty
  'prof.sharma@campus.edu', 'dr.mehta@campus.edu',
  // seniors
  'arjun.senior@campus.edu', 'priya.senior@campus.edu',
  'rohan.senior@campus.edu', 'neha.senior@campus.edu',
  'vikram.senior@campus.edu',
  // students
  'amit.student@campus.edu', 'sneha.student@campus.edu',
  'rahul.student@campus.edu', 'pooja.student@campus.edu',
  'kiran.student@campus.edu', 'dev.student@campus.edu',
  'ananya.student@campus.edu', 'harsh.student@campus.edu',
  'meera.student@campus.edu', 'siddharth.student@campus.edu',
]);

async function main() {
  // ── Connect ────────────────────────────────────────────────────────────────
  await mongoose.connect(process.env.MONGO_URI, {
    serverSelectionTimeoutMS: 15000,
  });
  console.log('✅ MongoDB connected');

  // ── Wipe previous seed data only ──────────────────────────────────────────
  console.log('🧹 Removing previous seed data…');
  const oldUsers = await User.find({ email: { $in: [...SEED_EMAILS] } }).select('_id');
  const oldIds = oldUsers.map((u) => u._id);

  await Promise.all([
    User.deleteMany({ email: { $in: [...SEED_EMAILS] } }),
    Note.deleteMany({ user_id: { $in: oldIds } }),
    Resource.deleteMany({ user_id: { $in: oldIds } }),
    Doubt.deleteMany({ user_id: { $in: oldIds } }),
    DoubtAnswer.deleteMany({ user_id: { $in: oldIds } }),
    Quiz.deleteMany({ user_id: { $in: oldIds } }),
    QuizAttempt.deleteMany({ user_id: { $in: oldIds } }),
    Hackathon.deleteMany({ user_id: { $in: oldIds } }),
    HackathonRegistration.deleteMany({ user_id: { $in: oldIds } }),
    CommunityPost.deleteMany({ user_id: { $in: oldIds } }),
    CommunityComment.deleteMany({ user_id: { $in: oldIds } }),
    MentorshipRequest.deleteMany({
      $or: [{ junior_id: { $in: oldIds } }, { senior_id: { $in: oldIds } }],
    }),
    Notification.deleteMany({ user_id: { $in: oldIds } }),
    RoadmapProgress.deleteMany({ user_id: { $in: oldIds } }),
    Resume.deleteMany({ user_id: { $in: oldIds } }),
    CareerRoadmap.deleteMany({}),
    UserNote.deleteMany({ user_id: { $in: oldIds } }),
  ]);
  console.log('✅ Previous seed data cleared');

  // ══════════════════════════════════════════════════════════════════════════
  // 1. USERS
  // ══════════════════════════════════════════════════════════════════════════
  console.log('👤 Seeding users…');
  const hash = await bcrypt.hash('password123', 10);

  const usersRaw = [
    // ── Faculty / Admin ──────────────────────────────────────────────────
    {
      full_name: 'Prof. Rajesh Sharma',
      email: 'prof.sharma@campus.edu',
      password: hash,
      role: 'faculty',
      college: 'MIT College of Engineering',
      department: 'Engineering',
      branch: 'Computer Science',
      semester: 8,
      graduation_year: 2005,
      bio: 'Professor of Computer Science with 18 years of industry and academic experience.',
      skills: ['Teaching', 'Research', 'Machine Learning', 'Python'],
      programming_languages: ['Python', 'Java', 'C++'],
      projects: ['Smart Campus Platform', 'AI Grading System'],
      certifications: ['Google Cloud Professional', 'AWS Solutions Architect'],
      achievements: ['Best Faculty Award 2022', 'Research Grant Winner 2021'],
      github: 'https://github.com/rajesh-sharma',
      linkedin: 'https://linkedin.com/in/rajesh-sharma',
      portfolio: 'https://rajesh-sharma.dev',
      xp: 5200, level: 52, learning_streak: 120,
    },
    {
      full_name: 'Dr. Anita Mehta',
      email: 'dr.mehta@campus.edu',
      password: hash,
      role: 'faculty',
      college: 'VIT University',
      department: 'Engineering',
      branch: 'Information Technology',
      semester: 8,
      graduation_year: 2003,
      bio: 'Head of IT department, specialising in cloud computing and distributed systems.',
      skills: ['Cloud Computing', 'Docker', 'Kubernetes', 'AWS'],
      programming_languages: ['Python', 'Go', 'Shell'],
      projects: ['Campus Cloud Infrastructure', 'Student Analytics Dashboard'],
      certifications: ['AWS Solutions Architect Professional', 'CKA'],
      achievements: ['Innovation Award 2023', 'Published 12 Research Papers'],
      github: 'https://github.com/anita-mehta',
      linkedin: 'https://linkedin.com/in/anita-mehta',
      portfolio: '',
      xp: 4800, level: 48, learning_streak: 90,
    },
    // ── Seniors ──────────────────────────────────────────────────────────
    {
      full_name: 'Arjun Kapoor',
      email: 'arjun.senior@campus.edu',
      password: hash,
      role: 'senior',
      college: 'MIT College of Engineering',
      department: 'Engineering',
      branch: 'Computer Science',
      semester: 7,
      graduation_year: 2025,
      bio: 'Final-year CS student. SDE intern at Google. Open source contributor.',
      skills: ['React', 'Node.js', 'System Design', 'DSA'],
      programming_languages: ['JavaScript', 'TypeScript', 'Python', 'C++'],
      projects: ['CampusSphere', 'CodeCollab', 'AlgoViz'],
      certifications: ['Google Associate Cloud Engineer', 'LeetCode 2000+'],
      achievements: ['Google STEP Intern 2024', 'Hackathon Winner x3', 'GPA 9.2/10'],
      github: 'https://github.com/arjun-kapoor',
      linkedin: 'https://linkedin.com/in/arjun-kapoor',
      portfolio: 'https://arjunkapoor.dev',
      xp: 3800, level: 38, learning_streak: 45,
    },
    {
      full_name: 'Priya Nair',
      email: 'priya.senior@campus.edu',
      password: hash,
      role: 'senior',
      college: 'VIT University',
      department: 'Engineering',
      branch: 'Information Technology',
      semester: 7,
      graduation_year: 2025,
      bio: 'Full-stack developer, ML enthusiast. Microsoft intern. Mentor to 10+ juniors.',
      skills: ['Python', 'Machine Learning', 'React', 'FastAPI'],
      programming_languages: ['Python', 'JavaScript', 'SQL'],
      projects: ['ML Course Recommender', 'Resume Analyser', 'Study Planner'],
      certifications: ['Azure AI Engineer', 'TensorFlow Developer'],
      achievements: ['Microsoft Learn Student Ambassador', 'Smart India Hackathon Winner'],
      github: 'https://github.com/priya-nair',
      linkedin: 'https://linkedin.com/in/priya-nair',
      portfolio: 'https://priyanair.me',
      xp: 3500, level: 35, learning_streak: 30,
    },
    {
      full_name: 'Rohan Verma',
      email: 'rohan.senior@campus.edu',
      password: hash,
      role: 'senior',
      college: 'BITS Pilani',
      department: 'Engineering',
      branch: 'Electronics & Communication',
      semester: 7,
      graduation_year: 2025,
      bio: 'ECE senior with strong DSP and embedded systems background. ISRO project contributor.',
      skills: ['Embedded C', 'MATLAB', 'FPGA', 'Signal Processing'],
      programming_languages: ['C', 'C++', 'MATLAB', 'Python'],
      projects: ['IoT Weather Station', 'FPGA Image Processor'],
      certifications: ['NPTEL Signal Processing', 'Texas Instruments Certified'],
      achievements: ['ISRO Research Internship', 'Best Technical Paper Award'],
      github: 'https://github.com/rohan-verma',
      linkedin: 'https://linkedin.com/in/rohan-verma',
      portfolio: '',
      xp: 2900, level: 29, learning_streak: 22,
    },
    {
      full_name: 'Neha Singh',
      email: 'neha.senior@campus.edu',
      password: hash,
      role: 'senior',
      college: 'NIT Trichy',
      department: 'Engineering',
      branch: 'Computer Science',
      semester: 6,
      graduation_year: 2026,
      bio: 'Competitive programmer. Codeforces Expert. Backend dev specialising in distributed systems.',
      skills: ['Competitive Programming', 'Go', 'Redis', 'Kafka'],
      programming_languages: ['C++', 'Go', 'Python', 'Java'],
      projects: ['Distributed Key-Value Store', 'Real-time Chat App'],
      certifications: ['Codeforces Expert', 'Google Hash Code Finalist'],
      achievements: ['ICPC Asia Regionalist', 'Top 100 Codeforces India'],
      github: 'https://github.com/neha-singh',
      linkedin: 'https://linkedin.com/in/neha-singh',
      portfolio: '',
      xp: 3200, level: 32, learning_streak: 60,
    },
    {
      full_name: 'Vikram Patel',
      email: 'vikram.senior@campus.edu',
      password: hash,
      role: 'senior',
      college: 'Pune Institute of Computer Technology',
      department: 'Engineering',
      branch: 'Computer Science',
      semester: 6,
      graduation_year: 2026,
      bio: 'DevOps enthusiast. Cloud-native developer. AWS Community Builder.',
      skills: ['AWS', 'Docker', 'Kubernetes', 'Terraform', 'CI/CD'],
      programming_languages: ['Python', 'Shell', 'Go', 'JavaScript'],
      projects: ['K8s Campus Cluster', 'Auto-Deploy Pipeline', 'Cost Optimisation Tool'],
      certifications: ['AWS Solutions Architect Associate', 'Certified Kubernetes Administrator'],
      achievements: ['AWS Community Builder 2024', 'DevOps Hackathon 1st Place'],
      github: 'https://github.com/vikram-patel',
      linkedin: 'https://linkedin.com/in/vikram-patel',
      portfolio: 'https://vikrampatel.cloud',
      xp: 2800, level: 28, learning_streak: 18,
    },
    // ── Students ─────────────────────────────────────────────────────────
    {
      full_name: 'Amit Joshi',
      email: 'amit.student@campus.edu',
      password: hash,
      role: 'student',
      college: 'MIT College of Engineering',
      department: 'Engineering',
      branch: 'Computer Science',
      semester: 4,
      graduation_year: 2027,
      bio: 'CS sophomore passionate about web development and open source.',
      skills: ['HTML', 'CSS', 'JavaScript', 'React'],
      programming_languages: ['JavaScript', 'Python', 'C'],
      projects: ['Portfolio Website', 'Todo App'],
      certifications: ['freeCodeCamp Responsive Web Design'],
      achievements: ['Dean\'s List Semester 3'],
      github: 'https://github.com/amit-joshi',
      linkedin: '', portfolio: '',
      xp: 850, level: 9, learning_streak: 12,
    },
    {
      full_name: 'Sneha Kulkarni',
      email: 'sneha.student@campus.edu',
      password: hash,
      role: 'student',
      college: 'VIT University',
      department: 'Engineering',
      branch: 'Information Technology',
      semester: 4,
      graduation_year: 2027,
      bio: 'IT student interested in UI/UX design and frontend development.',
      skills: ['Figma', 'React', 'Tailwind CSS', 'Adobe XD'],
      programming_languages: ['JavaScript', 'Python'],
      projects: ['E-commerce UI Redesign', 'Campus App Wireframes'],
      certifications: ['Google UX Design Certificate'],
      achievements: ['UI/UX Hackathon Finalist'],
      github: '', linkedin: 'https://linkedin.com/in/sneha-kulkarni', portfolio: '',
      xp: 620, level: 7, learning_streak: 8,
    },
    {
      full_name: 'Rahul Gupta',
      email: 'rahul.student@campus.edu',
      password: hash,
      role: 'student',
      college: 'BITS Pilani',
      department: 'Engineering',
      branch: 'Computer Science',
      semester: 3,
      graduation_year: 2028,
      bio: 'First-year CS student learning DSA and competitive programming.',
      skills: ['C++', 'DSA', 'Problem Solving'],
      programming_languages: ['C++', 'C', 'Python'],
      projects: ['Sorting Visualiser'],
      certifications: [],
      achievements: ['College Coding Contest 2nd Place'],
      github: 'https://github.com/rahul-gupta',
      linkedin: '', portfolio: '',
      xp: 340, level: 4, learning_streak: 5,
    },
    {
      full_name: 'Pooja Reddy',
      email: 'pooja.student@campus.edu',
      password: hash,
      role: 'student',
      college: 'NIT Trichy',
      department: 'Engineering',
      branch: 'Electronics & Communication',
      semester: 5,
      graduation_year: 2026,
      bio: 'ECE student exploring IoT and embedded systems.',
      skills: ['Arduino', 'Raspberry Pi', 'C', 'IoT'],
      programming_languages: ['C', 'Python', 'MATLAB'],
      projects: ['Smart Home Automation'],
      certifications: ['NPTEL IoT'],
      achievements: ['Technical Fest Best Project'],
      github: '', linkedin: '', portfolio: '',
      xp: 510, level: 6, learning_streak: 3,
    },
    {
      full_name: 'Kiran Desai',
      email: 'kiran.student@campus.edu',
      password: hash,
      role: 'student',
      college: 'Pune Institute of Computer Technology',
      department: 'Engineering',
      branch: 'Computer Science',
      semester: 2,
      graduation_year: 2028,
      bio: 'Freshman passionate about AI and neural networks.',
      skills: ['Python', 'NumPy', 'Pandas'],
      programming_languages: ['Python'],
      projects: ['MNIST Digit Classifier'],
      certifications: ['Coursera Python for Everybody'],
      achievements: [],
      github: '', linkedin: '', portfolio: '',
      xp: 180, level: 2, learning_streak: 7,
    },
    {
      full_name: 'Dev Malhotra',
      email: 'dev.student@campus.edu',
      password: hash,
      role: 'student',
      college: 'MIT College of Engineering',
      department: 'Engineering',
      branch: 'Information Technology',
      semester: 6,
      graduation_year: 2026,
      bio: 'Backend developer learning Spring Boot and microservices.',
      skills: ['Java', 'Spring Boot', 'MySQL', 'REST APIs'],
      programming_languages: ['Java', 'SQL', 'Python'],
      projects: ['Library Management System', 'Student Portal API'],
      certifications: ['Oracle Java SE 11'],
      achievements: ['Best Backend Project Award'],
      github: 'https://github.com/dev-malhotra',
      linkedin: 'https://linkedin.com/in/dev-malhotra',
      portfolio: '',
      xp: 1120, level: 12, learning_streak: 20,
    },
    {
      full_name: 'Ananya Iyer',
      email: 'ananya.student@campus.edu',
      password: hash,
      role: 'student',
      college: 'VIT University',
      department: 'Engineering',
      branch: 'Computer Science',
      semester: 5,
      graduation_year: 2026,
      bio: 'Data science enthusiast. Kaggle contributor. Statistics nerd.',
      skills: ['Python', 'Pandas', 'Scikit-learn', 'Tableau'],
      programming_languages: ['Python', 'R', 'SQL'],
      projects: ['Sales Forecasting Model', 'Twitter Sentiment Analyser'],
      certifications: ['IBM Data Science', 'Kaggle Competitions Expert'],
      achievements: ['Kaggle Silver Medal', 'Analytics Vidhya Top 10%'],
      github: 'https://github.com/ananya-iyer',
      linkedin: 'https://linkedin.com/in/ananya-iyer',
      portfolio: '',
      xp: 980, level: 10, learning_streak: 15,
    },
    {
      full_name: 'Harsh Tiwari',
      email: 'harsh.student@campus.edu',
      password: hash,
      role: 'student',
      college: 'NIT Trichy',
      department: 'Engineering',
      branch: 'Mechanical',
      semester: 4,
      graduation_year: 2027,
      bio: 'Mechanical student with interest in robotics and automation.',
      skills: ['AutoCAD', 'SolidWorks', 'Python', 'ROS'],
      programming_languages: ['Python', 'C'],
      projects: ['Line Following Robot', '3D Printed Prosthetic Arm'],
      certifications: ['NPTEL Robotics'],
      achievements: ['Robocon College Qualifier'],
      github: '', linkedin: '', portfolio: '',
      xp: 460, level: 5, learning_streak: 4,
    },
    {
      full_name: 'Meera Pillai',
      email: 'meera.student@campus.edu',
      password: hash,
      role: 'student',
      college: 'MIT College of Engineering',
      department: 'Engineering',
      branch: 'Computer Science',
      semester: 3,
      graduation_year: 2028,
      bio: 'CS freshman. Loves competitive programming and math.',
      skills: ['C++', 'Math', 'Logic'],
      programming_languages: ['C++', 'Python'],
      projects: [],
      certifications: [],
      achievements: [],
      github: '', linkedin: '', portfolio: '',
      xp: 210, level: 3, learning_streak: 2,
    },
    {
      full_name: 'Siddharth Rao',
      email: 'siddharth.student@campus.edu',
      password: hash,
      role: 'student',
      college: 'BITS Pilani',
      department: 'Engineering',
      branch: 'Computer Science',
      semester: 6,
      graduation_year: 2026,
      bio: 'Mobile developer. Published 2 Android apps on Play Store.',
      skills: ['Android', 'Kotlin', 'Flutter', 'Firebase'],
      programming_languages: ['Kotlin', 'Dart', 'Java'],
      projects: ['Campus Navigator App', 'Study Timer App'],
      certifications: ['Google Associate Android Developer'],
      achievements: ['Google Play Published Developer', 'Hackathon Finalist'],
      github: 'https://github.com/siddharth-rao',
      linkedin: 'https://linkedin.com/in/siddharth-rao',
      portfolio: '',
      xp: 1350, level: 14, learning_streak: 25,
    },
  ];

  const users = await User.insertMany(usersRaw);
  console.log(`  ✅ ${users.length} users inserted`);

  // Build lookup maps
  const byEmail = {};
  users.forEach((u) => { byEmail[u.email] = u; });

  const faculty = users.filter((u) => u.role === 'faculty');
  const seniors = users.filter((u) => u.role === 'senior');
  const students = users.filter((u) => u.role === 'student');
  const allUsers = users;

  // ══════════════════════════════════════════════════════════════════════════
  // 2. CAREER ROADMAPS
  // ══════════════════════════════════════════════════════════════════════════
  console.log('🗺  Seeding career roadmaps…');
  const roadmapsData = [
    {
      career_key: 'full_stack',
      career_name: 'Full Stack Developer',
      description: 'Become a production-ready full-stack developer with React and Node.js.',
      phases: [
        {
          phase: 1,
          title: 'Frontend Foundations (0–30 days)',
          tasks: [
            { id: 'fs-1-1', title: 'Master HTML5 & CSS3', description: 'Semantic HTML, Flexbox, Grid, animations', skill: 'HTML/CSS', priority: 'high', duration: '1 week', difficulty: 'beginner' },
            { id: 'fs-1-2', title: 'JavaScript ES6+', description: 'Closures, promises, async/await, destructuring', skill: 'JavaScript', priority: 'high', duration: '2 weeks', difficulty: 'intermediate' },
            { id: 'fs-1-3', title: 'React Fundamentals', description: 'Components, props, state, hooks, routing', skill: 'React', priority: 'high', duration: '1 week', difficulty: 'intermediate' },
          ],
        },
        {
          phase: 2,
          title: 'Backend Development (30–60 days)',
          tasks: [
            { id: 'fs-2-1', title: 'Node.js & Express', description: 'REST APIs, middleware, error handling', skill: 'Node.js', priority: 'high', duration: '2 weeks', difficulty: 'intermediate' },
            { id: 'fs-2-2', title: 'MongoDB & Mongoose', description: 'Schema design, CRUD, aggregation', skill: 'MongoDB', priority: 'high', duration: '1 week', difficulty: 'intermediate' },
            { id: 'fs-2-3', title: 'Authentication & Security', description: 'JWT, bcrypt, CORS, rate limiting', skill: 'Security', priority: 'medium', duration: '1 week', difficulty: 'intermediate' },
          ],
        },
        {
          phase: 3,
          title: 'Production & Deployment (60–90 days)',
          tasks: [
            { id: 'fs-3-1', title: 'Docker & Containers', description: 'Dockerise apps, docker-compose', skill: 'DevOps', priority: 'medium', duration: '1 week', difficulty: 'intermediate' },
            { id: 'fs-3-2', title: 'Deploy to AWS/Vercel', description: 'EC2, S3, Vercel, environment management', skill: 'Cloud', priority: 'high', duration: '1 week', difficulty: 'intermediate' },
            { id: 'fs-3-3', title: 'Full-Stack Capstone Project', description: 'Build and deploy a complete SaaS application', skill: 'Full Stack', priority: 'high', duration: '2 weeks', difficulty: 'advanced' },
          ],
        },
      ],
    },
    {
      career_key: 'data_scientist',
      career_name: 'Data Scientist',
      description: 'Go from data analysis to building production ML models.',
      phases: [
        {
          phase: 1,
          title: 'Data Analysis Foundations (0–30 days)',
          tasks: [
            { id: 'ds-1-1', title: 'Python for Data Science', description: 'NumPy, Pandas, data wrangling', skill: 'Python', priority: 'high', duration: '2 weeks', difficulty: 'beginner' },
            { id: 'ds-1-2', title: 'Data Visualisation', description: 'Matplotlib, Seaborn, Plotly dashboards', skill: 'Visualisation', priority: 'medium', duration: '1 week', difficulty: 'beginner' },
            { id: 'ds-1-3', title: 'Statistics & Probability', description: 'Distributions, hypothesis testing, A/B testing', skill: 'Statistics', priority: 'high', duration: '1 week', difficulty: 'intermediate' },
          ],
        },
        {
          phase: 2,
          title: 'Machine Learning (30–60 days)',
          tasks: [
            { id: 'ds-2-1', title: 'Supervised Learning', description: 'Regression, classification, decision trees, ensembles', skill: 'ML', priority: 'high', duration: '2 weeks', difficulty: 'intermediate' },
            { id: 'ds-2-2', title: 'Unsupervised Learning', description: 'Clustering, PCA, anomaly detection', skill: 'ML', priority: 'medium', duration: '1 week', difficulty: 'intermediate' },
            { id: 'ds-2-3', title: 'Deep Learning Basics', description: 'Neural networks, CNNs with TensorFlow/PyTorch', skill: 'Deep Learning', priority: 'medium', duration: '1 week', difficulty: 'advanced' },
          ],
        },
        {
          phase: 3,
          title: 'MLOps & Real Projects (60–90 days)',
          tasks: [
            { id: 'ds-3-1', title: 'Model Deployment', description: 'FastAPI, Docker, model serving at scale', skill: 'MLOps', priority: 'high', duration: '1 week', difficulty: 'advanced' },
            { id: 'ds-3-2', title: 'Kaggle Competition', description: 'Participate in an active Kaggle competition', skill: 'Competition', priority: 'medium', duration: '2 weeks', difficulty: 'advanced' },
            { id: 'ds-3-3', title: 'End-to-End ML Project', description: 'Problem → data → model → API → dashboard', skill: 'Full Pipeline', priority: 'high', duration: '1 week', difficulty: 'advanced' },
          ],
        },
      ],
    },
    {
      career_key: 'devops',
      career_name: 'DevOps Engineer',
      description: 'Master CI/CD, containers, cloud infrastructure, and SRE practices.',
      phases: [
        {
          phase: 1,
          title: 'Linux & Networking (0–30 days)',
          tasks: [
            { id: 'do-1-1', title: 'Linux Administration', description: 'Shell scripting, file permissions, process management', skill: 'Linux', priority: 'high', duration: '2 weeks', difficulty: 'beginner' },
            { id: 'do-1-2', title: 'Networking Fundamentals', description: 'TCP/IP, DNS, HTTP, load balancers', skill: 'Networking', priority: 'high', duration: '1 week', difficulty: 'intermediate' },
            { id: 'do-1-3', title: 'Git & Version Control', description: 'Branching strategies, rebase, CI workflows', skill: 'Git', priority: 'medium', duration: '1 week', difficulty: 'beginner' },
          ],
        },
        {
          phase: 2,
          title: 'Containers & Cloud (30–60 days)',
          tasks: [
            { id: 'do-2-1', title: 'Docker Mastery', description: 'Dockerfiles, multi-stage builds, docker-compose', skill: 'Docker', priority: 'high', duration: '1 week', difficulty: 'intermediate' },
            { id: 'do-2-2', title: 'Kubernetes', description: 'Pods, services, deployments, Helm charts', skill: 'Kubernetes', priority: 'high', duration: '2 weeks', difficulty: 'advanced' },
            { id: 'do-2-3', title: 'AWS Core Services', description: 'EC2, S3, RDS, VPC, IAM, EKS', skill: 'AWS', priority: 'high', duration: '1 week', difficulty: 'intermediate' },
          ],
        },
        {
          phase: 3,
          title: 'CI/CD & Monitoring (60–90 days)',
          tasks: [
            { id: 'do-3-1', title: 'CI/CD Pipelines', description: 'GitHub Actions, Jenkins, GitLab CI', skill: 'CI/CD', priority: 'high', duration: '1 week', difficulty: 'intermediate' },
            { id: 'do-3-2', title: 'Infrastructure as Code', description: 'Terraform, Ansible, CloudFormation', skill: 'IaC', priority: 'medium', duration: '1 week', difficulty: 'advanced' },
            { id: 'do-3-3', title: 'Monitoring & Observability', description: 'Prometheus, Grafana, ELK Stack, alerting', skill: 'Monitoring', priority: 'medium', duration: '2 weeks', difficulty: 'advanced' },
          ],
        },
      ],
    },
    {
      career_key: 'ai_ml',
      career_name: 'AI/ML Engineer',
      description: 'Build production AI systems from research to deployment.',
      phases: [
        {
          phase: 1,
          title: 'ML Foundations (0–30 days)',
          tasks: [
            { id: 'ai-1-1', title: 'Mathematics for ML', description: 'Linear algebra, calculus, probability', skill: 'Mathematics', priority: 'high', duration: '2 weeks', difficulty: 'intermediate' },
            { id: 'ai-1-2', title: 'Classical ML Algorithms', description: 'Regression, SVM, Random Forest, XGBoost', skill: 'ML', priority: 'high', duration: '2 weeks', difficulty: 'intermediate' },
          ],
        },
        {
          phase: 2,
          title: 'Deep Learning (30–60 days)',
          tasks: [
            { id: 'ai-2-1', title: 'Neural Networks & Backprop', description: 'Build networks from scratch, understand gradients', skill: 'Deep Learning', priority: 'high', duration: '1 week', difficulty: 'advanced' },
            { id: 'ai-2-2', title: 'CNNs & Vision', description: 'Image classification, object detection, transfer learning', skill: 'Computer Vision', priority: 'high', duration: '1 week', difficulty: 'advanced' },
            { id: 'ai-2-3', title: 'NLP & Transformers', description: 'Attention, BERT, GPT, fine-tuning LLMs', skill: 'NLP', priority: 'high', duration: '2 weeks', difficulty: 'advanced' },
          ],
        },
        {
          phase: 3,
          title: 'Production AI (60–90 days)',
          tasks: [
            { id: 'ai-3-1', title: 'MLOps & Model Registry', description: 'MLflow, DVC, model versioning, A/B testing', skill: 'MLOps', priority: 'high', duration: '1 week', difficulty: 'advanced' },
            { id: 'ai-3-2', title: 'LLM Applications', description: 'RAG, LangChain, vector databases, prompt engineering', skill: 'LLMs', priority: 'high', duration: '2 weeks', difficulty: 'advanced' },
            { id: 'ai-3-3', title: 'AI Capstone Project', description: 'Build a complete AI-powered product', skill: 'Full Pipeline', priority: 'high', duration: '1 week', difficulty: 'advanced' },
          ],
        },
      ],
    },
  ];
  const roadmaps = await CareerRoadmap.insertMany(roadmapsData);
  console.log(`  ✅ ${roadmaps.length} career roadmaps inserted`);

  // ══════════════════════════════════════════════════════════════════════════
  // 3. NOTES (status: approved so they show on the Notes page)
  // ══════════════════════════════════════════════════════════════════════════
  console.log('📄 Seeding notes…');
  const notesData = [
    { user_id: byEmail['arjun.senior@campus.edu']._id, title: 'Complete DSA Cheat Sheet', description: 'Arrays, linked lists, trees, graphs, DP — all patterns with code examples.', subject: 'Data Structures', branch: 'Computer Science', semester: 5, department: 'Engineering', tags: ['DSA', 'Arrays', 'Trees', 'DP'], status: 'approved', views: 342, downloads: 128, likes: 87, saves: 54, rating_sum: 230, rating_count: 47, file_type: 'pdf', file_name: 'dsa-cheatsheet.pdf', file_size: 1240000 },
    { user_id: byEmail['priya.senior@campus.edu']._id, title: 'Machine Learning Algorithms Notes', description: 'Supervised and unsupervised learning algorithms explained with math and code.', subject: 'Machine Learning', branch: 'Computer Science', semester: 6, department: 'Engineering', tags: ['ML', 'Supervised', 'Unsupervised', 'Python'], status: 'approved', views: 289, downloads: 95, likes: 63, saves: 41, rating_sum: 195, rating_count: 39, file_type: 'pdf', file_name: 'ml-notes.pdf', file_size: 980000 },
    { user_id: byEmail['neha.senior@campus.edu']._id, title: 'Operating Systems — Complete Notes', description: 'Process management, scheduling, memory, file systems, deadlocks.', subject: 'Operating Systems', branch: 'Computer Science', semester: 5, department: 'Engineering', tags: ['OS', 'Scheduling', 'Memory', 'Deadlock'], status: 'approved', views: 412, downloads: 167, likes: 102, saves: 78, rating_sum: 310, rating_count: 62, file_type: 'pdf', file_name: 'os-notes.pdf', file_size: 1560000 },
    { user_id: byEmail['vikram.senior@campus.edu']._id, title: 'Docker & Kubernetes Quickstart', description: 'From zero to deploying containers in production. Practical guide.', subject: 'Cloud Computing', branch: 'Computer Science', semester: 6, department: 'Engineering', tags: ['Docker', 'Kubernetes', 'DevOps', 'Cloud'], status: 'approved', views: 198, downloads: 74, likes: 48, saves: 35, rating_sum: 145, rating_count: 29, file_type: 'pdf', file_name: 'docker-k8s.pdf', file_size: 870000 },
    { user_id: byEmail['rohan.senior@campus.edu']._id, title: 'Digital Logic Design — Unit 1-4', description: 'Boolean algebra, gates, flip-flops, combinational and sequential circuits.', subject: 'Digital Logic Design', branch: 'Electronics & Communication', semester: 3, department: 'Engineering', tags: ['DLD', 'Logic Gates', 'Flip-Flops'], status: 'approved', views: 156, downloads: 58, likes: 34, saves: 22, rating_sum: 98, rating_count: 20, file_type: 'pdf', file_name: 'dld-notes.pdf', file_size: 720000 },
    { user_id: byEmail['dev.student@campus.edu']._id, title: 'Database Management Systems', description: 'ER diagrams, SQL queries, normalisation, transactions, ACID properties.', subject: 'Database Management', branch: 'Information Technology', semester: 4, department: 'Engineering', tags: ['DBMS', 'SQL', 'Normalisation'], status: 'approved', views: 267, downloads: 89, likes: 56, saves: 43, rating_sum: 178, rating_count: 36, file_type: 'pdf', file_name: 'dbms-notes.pdf', file_size: 1100000 },
    { user_id: byEmail['ananya.student@campus.edu']._id, title: 'Python Data Science Toolkit', description: 'Pandas, NumPy, Matplotlib and Scikit-learn — cheatsheet format.', subject: 'Machine Learning', branch: 'Computer Science', semester: 5, department: 'Engineering', tags: ['Python', 'Pandas', 'NumPy', 'ML'], status: 'approved', views: 203, downloads: 76, likes: 52, saves: 38, rating_sum: 155, rating_count: 31, file_type: 'pdf', file_name: 'python-ds-toolkit.pdf', file_size: 640000 },
    { user_id: byEmail['siddharth.student@campus.edu']._id, title: 'Computer Networks — All Units', description: 'OSI model, TCP/IP, routing, switching, DNS, HTTP, security protocols.', subject: 'Computer Networks', branch: 'Computer Science', semester: 5, department: 'Engineering', tags: ['Networks', 'OSI', 'TCP/IP', 'Routing'], status: 'approved', views: 178, downloads: 62, likes: 41, saves: 29, rating_sum: 122, rating_count: 24, file_type: 'pdf', file_name: 'cn-notes.pdf', file_size: 980000 },
    { user_id: byEmail['amit.student@campus.edu']._id, title: 'React Hooks Explained', description: 'useState, useEffect, useContext, useReducer with real examples.', subject: 'Web Development', branch: 'Computer Science', semester: 4, department: 'Engineering', tags: ['React', 'Hooks', 'Frontend'], status: 'approved', views: 145, downloads: 48, likes: 31, saves: 19, rating_sum: 94, rating_count: 19, file_type: 'pdf', file_name: 'react-hooks.pdf', file_size: 510000 },
    { user_id: byEmail['arjun.senior@campus.edu']._id, title: 'System Design Interview Prep', description: 'Scalable architectures, caching, load balancing, databases at scale.', subject: 'Software Engineering', branch: 'Computer Science', semester: 7, department: 'Engineering', tags: ['System Design', 'Interview', 'Scalability'], status: 'approved', views: 521, downloads: 234, likes: 156, saves: 112, rating_sum: 465, rating_count: 93, file_type: 'pdf', file_name: 'system-design.pdf', file_size: 2100000 },
    // Pending notes (for admin to approve)
    { user_id: byEmail['rahul.student@campus.edu']._id, title: 'C++ STL Reference', description: 'Vector, map, set, priority_queue, algorithms — with complexity.', subject: 'Data Structures', branch: 'Computer Science', semester: 3, department: 'Engineering', tags: ['C++', 'STL'], status: 'pending', views: 0, downloads: 0, likes: 0, saves: 0, rating_sum: 0, rating_count: 0, file_type: 'pdf', file_name: 'cpp-stl.pdf', file_size: 450000 },
    { user_id: byEmail['meera.student@campus.edu']._id, title: 'Mathematics Unit 2 Notes', description: 'Differential equations, Laplace transforms, Fourier series.', subject: 'Mathematics', branch: 'Computer Science', semester: 3, department: 'Engineering', tags: ['Maths', 'Differential Equations'], status: 'pending', views: 0, downloads: 0, likes: 0, saves: 0, rating_sum: 0, rating_count: 0, file_type: 'pdf', file_name: 'maths-unit2.pdf', file_size: 380000 },
  ];
  const notes = await Note.insertMany(notesData);
  console.log(`  ✅ ${notes.length} notes inserted`);

  // ══════════════════════════════════════════════════════════════════════════
  // 4. RESOURCES
  // ══════════════════════════════════════════════════════════════════════════
  console.log('📚 Seeding resources…');
  const resourcesData = [
    { user_id: byEmail['prof.sharma@campus.edu']._id, title: 'DSA Important Questions — Exam Edition', description: '50 most important DSA questions for semester exams with detailed solutions.', resource_type: 'important_questions', subject: 'Data Structures', branch: 'Computer Science', semester: 5, department: 'Engineering', external_url: 'https://drive.google.com/dsa-questions', tags: ['DSA', 'Exam', 'Important'], views: 445, downloads: 198, rating_sum: 220, rating_count: 44 },
    { user_id: byEmail['dr.mehta@campus.edu']._id, title: 'Cloud Computing Previous Year Questions 2019–2023', description: 'Past 5 years question papers for Cloud Computing with solutions.', resource_type: 'previous_year_questions', subject: 'Cloud Computing', branch: 'Computer Science', semester: 6, department: 'Engineering', external_url: 'https://drive.google.com/cloud-pyq', tags: ['PYQ', 'Cloud', 'Exam'], views: 312, downloads: 143, rating_sum: 175, rating_count: 35 },
    { user_id: byEmail['prof.sharma@campus.edu']._id, title: 'Algorithm Design Chapter Notes — All Units', description: 'Greedy, divide & conquer, dynamic programming, backtracking — complete chapter notes.', resource_type: 'chapter_notes', subject: 'Algorithms', branch: 'Computer Science', semester: 4, department: 'Engineering', external_url: 'https://drive.google.com/algo-notes', tags: ['Algorithms', 'DP', 'Greedy'], views: 387, downloads: 167, rating_sum: 210, rating_count: 42 },
    { user_id: byEmail['dr.mehta@campus.edu']._id, title: 'Operating Systems Study Material', description: 'Reference textbook chapters, slides, and supplementary reading list.', resource_type: 'study_materials', subject: 'Operating Systems', branch: 'Computer Science', semester: 5, department: 'Engineering', external_url: 'https://drive.google.com/os-material', tags: ['OS', 'Study Material'], views: 256, downloads: 112, rating_sum: 148, rating_count: 30 },
    { user_id: byEmail['prof.sharma@campus.edu']._id, title: 'Database Management PYQ 2018–2023', description: 'Six years of DBMS question papers. SQL queries, normalisation, transactions.', resource_type: 'previous_year_questions', subject: 'Database Management', branch: 'Information Technology', semester: 4, department: 'Engineering', external_url: 'https://drive.google.com/dbms-pyq', tags: ['DBMS', 'PYQ', 'SQL'], views: 334, downloads: 155, rating_sum: 195, rating_count: 39 },
    { user_id: byEmail['dr.mehta@campus.edu']._id, title: 'Web Development Reference — MDN Curated', description: 'Curated collection of MDN resources for HTML, CSS, JavaScript and Web APIs.', resource_type: 'reference_materials', subject: 'Web Development', branch: 'Computer Science', semester: 4, department: 'Engineering', external_url: 'https://developer.mozilla.org/en-US', tags: ['Web', 'HTML', 'CSS', 'JavaScript'], views: 189, downloads: 78, rating_sum: 112, rating_count: 22 },
    { user_id: byEmail['prof.sharma@campus.edu']._id, title: 'Machine Learning Important Questions', description: 'Topic-wise important questions for ML end-sem examination.', resource_type: 'important_questions', subject: 'Machine Learning', branch: 'Computer Science', semester: 6, department: 'Engineering', external_url: 'https://drive.google.com/ml-important', tags: ['ML', 'Exam', 'Important'], views: 278, downloads: 124, rating_sum: 162, rating_count: 33 },
  ];
  const resources = await Resource.insertMany(resourcesData);
  console.log(`  ✅ ${resources.length} resources inserted`);

  // ══════════════════════════════════════════════════════════════════════════
  // 5. DOUBTS + ANSWERS
  // ══════════════════════════════════════════════════════════════════════════
  console.log('❓ Seeding doubts and answers…');
  const doubtsData = [
    { user_id: byEmail['amit.student@campus.edu']._id, title: 'What is the difference between BFS and DFS?', description: 'I understand both traverse graphs, but when should I use BFS vs DFS? Are there specific problem types?', subject: 'Data Structures', topic: 'Graph Traversal', tags: ['BFS', 'DFS', 'Graphs'], views: 156, upvotes: 34, downvotes: 1, answer_count: 3 },
    { user_id: byEmail['rahul.student@campus.edu']._id, title: 'How does virtual memory work in OS?', description: 'The concept of paging and segmentation confuses me. How does the OS map virtual addresses to physical addresses?', subject: 'Operating Systems', topic: 'Memory Management', tags: ['Virtual Memory', 'Paging', 'OS'], views: 203, upvotes: 28, downvotes: 0, answer_count: 2 },
    { user_id: byEmail['sneha.student@campus.edu']._id, title: 'What is the difference between SQL JOIN types?', description: 'INNER JOIN, LEFT JOIN, RIGHT JOIN, FULL OUTER JOIN — can someone explain with a visual example?', subject: 'Database Management', topic: 'SQL', tags: ['SQL', 'JOIN', 'DBMS'], views: 289, upvotes: 45, downvotes: 2, answer_count: 4 },
    { user_id: byEmail['kiran.student@campus.edu']._id, title: 'How to start with Deep Learning as a beginner?', description: 'I know Python and basic ML. What is the best path to start learning deep learning? Which framework first?', subject: 'Machine Learning', topic: 'Deep Learning', tags: ['Deep Learning', 'Beginner', 'TensorFlow', 'PyTorch'], views: 312, upvotes: 67, downvotes: 0, answer_count: 5 },
    { user_id: byEmail['pooja.student@campus.edu']._id, title: 'Explain the OSI model layers simply', description: 'My professor explained it but I still cannot memorise or understand what each layer does. Help!', subject: 'Computer Networks', topic: 'OSI Model', tags: ['OSI', 'Networking', 'Basics'], views: 178, upvotes: 23, downvotes: 0, answer_count: 2 },
    { user_id: byEmail['meera.student@campus.edu']._id, title: 'What is Big O notation and how to calculate it?', description: 'I am confused about how to determine time complexity. How do I calculate Big O for loops and recursion?', subject: 'Algorithms', topic: 'Complexity Analysis', tags: ['Big O', 'Complexity', 'Algorithms'], views: 245, upvotes: 52, downvotes: 1, answer_count: 3 },
  ];
  const doubts = await Doubt.insertMany(doubtsData);
  console.log(`  ✅ ${doubts.length} doubts inserted`);

  // Answers for each doubt
  const answersData = [
    // Doubt 0: BFS vs DFS
    { doubt_id: doubts[0]._id, user_id: byEmail['arjun.senior@campus.edu']._id, content: 'Great question! BFS uses a queue and explores all neighbors at the current depth before going deeper — use it for shortest path in unweighted graphs. DFS uses a stack (or recursion) and goes as deep as possible first — use it for detecting cycles, topological sort, or connected components. Rule of thumb: shortest path → BFS, exhaustive search/backtracking → DFS.', upvotes: 28, downvotes: 0, is_best: true },
    { doubt_id: doubts[0]._id, user_id: byEmail['neha.senior@campus.edu']._id, content: 'Adding to the above: BFS has O(V+E) time and O(V) space for the queue. DFS also O(V+E) time but O(H) space where H is the height of the recursion stack. For dense graphs, DFS is often more memory-efficient.', upvotes: 15, downvotes: 0, is_best: false },
    { doubt_id: doubts[0]._id, user_id: byEmail['prof.sharma@campus.edu']._id, content: 'From an exam perspective: BFS is always used for SSSP in unweighted graphs. DFS is used for SCC (Kosaraju\'s), bridges, and articulation points. Memorise these associations.', upvotes: 21, downvotes: 0, is_best: false },
    // Doubt 1: Virtual Memory
    { doubt_id: doubts[1]._id, user_id: byEmail['arjun.senior@campus.edu']._id, content: 'Virtual memory creates an abstraction over physical RAM. Each process gets its own virtual address space. The OS uses a page table to map virtual page numbers to physical frame numbers. When a page is not in RAM (page fault), the OS fetches it from disk. This allows programs larger than RAM to run and provides isolation between processes.', upvotes: 22, downvotes: 0, is_best: true },
    { doubt_id: doubts[1]._id, user_id: byEmail['dr.mehta@campus.edu']._id, content: 'Concise analogy: think of RAM as your desk and the hard disk as a filing cabinet. Virtual memory lets you pretend your desk is infinite — you only bring files to the desk when needed. The page table is your index of where each file lives.', upvotes: 18, downvotes: 0, is_best: false },
    // Doubt 2: SQL JOINs
    { doubt_id: doubts[2]._id, user_id: byEmail['dev.student@campus.edu']._id, content: 'INNER JOIN — only rows that match in both tables. LEFT JOIN — all rows from left table, matched rows from right (NULLs for no match). RIGHT JOIN — opposite of LEFT. FULL OUTER JOIN — all rows from both, NULLs where no match. Use LEFT JOIN most often in practice.', upvotes: 31, downvotes: 0, is_best: true },
    { doubt_id: doubts[2]._id, user_id: byEmail['prof.sharma@campus.edu']._id, content: 'For exams: know that INNER JOIN = intersection, FULL OUTER JOIN = union. Cross JOIN (Cartesian product) returns every combination — avoid in production!', upvotes: 19, downvotes: 0, is_best: false },
    // Doubt 3: Deep Learning
    { doubt_id: doubts[3]._id, user_id: byEmail['priya.senior@campus.edu']._id, content: 'Start with fast.ai (practical approach) or Andrew Ng\'s Deep Learning Specialisation on Coursera (theory first). For frameworks: PyTorch is preferred in research, TensorFlow/Keras for production. Build CNNs first (image classification), then RNNs/LSTMs, then Transformers. Practice on Kaggle competitions.', upvotes: 45, downvotes: 0, is_best: true },
    { doubt_id: doubts[3]._id, user_id: byEmail['ananya.student@campus.edu']._id, content: 'I started 6 months ago — fast.ai is amazing for beginners. You build a working image classifier in 2 hours! Then dig into the math after you see results. PyTorch feels more natural once you understand numpy.', upvotes: 29, downvotes: 0, is_best: false },
    // Doubt 4: OSI Model
    { doubt_id: doubts[4]._id, user_id: byEmail['siddharth.student@campus.edu']._id, content: 'Mnemonic: "Please Do Not Throw Sausage Pizza Away" = Physical, Data Link, Network, Transport, Session, Presentation, Application. Physical = cables. Data Link = MAC, switches. Network = IP, routers. Transport = TCP/UDP. Session = maintaining connections. Presentation = encryption/compression. Application = HTTP, FTP, DNS.', upvotes: 17, downvotes: 0, is_best: true },
    // Doubt 5: Big O
    { doubt_id: doubts[5]._id, user_id: byEmail['arjun.senior@campus.edu']._id, content: 'Drop constants and lower-order terms. Single loop = O(n). Nested loops = O(n²). Binary search = O(log n). Recursion: count the number of calls — T(n)=T(n/2)+O(1) solves to O(log n). Use the Master Theorem for divide-and-conquer recurrences.', upvotes: 38, downvotes: 0, is_best: true },
    { doubt_id: doubts[5]._id, user_id: byEmail['neha.senior@campus.edu']._id, content: 'Competitive programming shortcut: if your solution does ~10^8 operations per second, O(n) with n=10^6 takes 1s. O(n²) with n=10^4 takes 1s. Use this to quickly judge if your solution will TLE.', upvotes: 24, downvotes: 0, is_best: false },
  ];
  const answers = await DoubtAnswer.insertMany(answersData);
  // Set best_answer_ids
  await Doubt.findByIdAndUpdate(doubts[0]._id, { best_answer_id: answers[0]._id });
  await Doubt.findByIdAndUpdate(doubts[1]._id, { best_answer_id: answers[3]._id });
  await Doubt.findByIdAndUpdate(doubts[2]._id, { best_answer_id: answers[5]._id });
  await Doubt.findByIdAndUpdate(doubts[3]._id, { best_answer_id: answers[7]._id });
  await Doubt.findByIdAndUpdate(doubts[4]._id, { best_answer_id: answers[9]._id });
  await Doubt.findByIdAndUpdate(doubts[5]._id, { best_answer_id: answers[10]._id });
  console.log(`  ✅ ${doubts.length} doubts + ${answers.length} answers inserted`);

  // ══════════════════════════════════════════════════════════════════════════
  // 6. QUIZZES + QUESTIONS + ATTEMPTS
  // ══════════════════════════════════════════════════════════════════════════
  console.log('🧠 Seeding quizzes…');
  const quizzesData = [
    { user_id: byEmail['prof.sharma@campus.edu']._id, title: 'Data Structures Fundamentals', description: 'Test your knowledge of arrays, linked lists, stacks, queues, and trees.', subject: 'Data Structures', topic: 'Fundamentals', difficulty: 'easy', duration_minutes: 20, is_active: true },
    { user_id: byEmail['prof.sharma@campus.edu']._id, title: 'Algorithms & Complexity', description: 'Sorting, searching, time complexity, and algorithm design paradigms.', subject: 'Algorithms', topic: 'Complexity & Sorting', difficulty: 'medium', duration_minutes: 30, is_active: true },
    { user_id: byEmail['dr.mehta@campus.edu']._id, title: 'Operating Systems Concepts', description: 'Processes, threads, scheduling, memory management, and file systems.', subject: 'Operating Systems', topic: 'Core Concepts', difficulty: 'medium', duration_minutes: 25, is_active: true },
    { user_id: byEmail['dr.mehta@campus.edu']._id, title: 'DBMS Advanced', description: 'Normalisation, transactions, ACID, concurrency control, and query optimisation.', subject: 'Database Management', topic: 'Advanced', difficulty: 'hard', duration_minutes: 35, is_active: true },
    { user_id: byEmail['prof.sharma@campus.edu']._id, title: 'Computer Networks Quiz', description: 'OSI model, TCP/IP, routing algorithms, and network security.', subject: 'Computer Networks', topic: 'Fundamentals', difficulty: 'medium', duration_minutes: 25, is_active: true },
  ];
  const quizzes = await Quiz.insertMany(quizzesData);

  const questionsData = [
    // Quiz 0: Data Structures
    { quiz_id: quizzes[0]._id, question: 'What is the time complexity of accessing an element in an array by index?', options: ['O(n)', 'O(log n)', 'O(1)', 'O(n²)'], correct_index: 2, explanation: 'Arrays provide O(1) random access via direct memory addressing.' },
    { quiz_id: quizzes[0]._id, question: 'Which data structure uses LIFO order?', options: ['Queue', 'Stack', 'Linked List', 'Heap'], correct_index: 1, explanation: 'Stack follows Last In First Out (LIFO) — the last element pushed is the first popped.' },
    { quiz_id: quizzes[0]._id, question: 'What is the height of a balanced binary tree with n nodes?', options: ['O(n)', 'O(n²)', 'O(log n)', 'O(1)'], correct_index: 2, explanation: 'A balanced binary tree has height O(log n) because each level doubles the number of nodes.' },
    { quiz_id: quizzes[0]._id, question: 'Which traversal of a BST gives elements in sorted order?', options: ['Pre-order', 'Post-order', 'Level-order', 'In-order'], correct_index: 3, explanation: 'In-order traversal (left → root → right) of a BST visits nodes in ascending sorted order.' },
    { quiz_id: quizzes[0]._id, question: 'What is the time complexity of push/pop in a stack implemented with a linked list?', options: ['O(n)', 'O(log n)', 'O(n log n)', 'O(1)'], correct_index: 3, explanation: 'Both push and pop operate at the head of the linked list, making them O(1).' },
    // Quiz 1: Algorithms
    { quiz_id: quizzes[1]._id, question: 'What is the time complexity of merge sort?', options: ['O(n²)', 'O(n log n)', 'O(log n)', 'O(n)'], correct_index: 1, explanation: 'Merge sort divides the array in halves (log n levels) and merges in O(n), giving O(n log n).' },
    { quiz_id: quizzes[1]._id, question: 'Which algorithm design paradigm does binary search use?', options: ['Greedy', 'Dynamic Programming', 'Divide and Conquer', 'Backtracking'], correct_index: 2, explanation: 'Binary search divides the search space in half each step — classic divide and conquer.' },
    { quiz_id: quizzes[1]._id, question: 'What is the space complexity of quicksort in the worst case?', options: ['O(1)', 'O(log n)', 'O(n)', 'O(n²)'], correct_index: 2, explanation: 'Worst case (already sorted), quicksort makes n recursive calls, using O(n) stack space.' },
    { quiz_id: quizzes[1]._id, question: 'Which of the following has the best average-case time complexity for sorting?', options: ['Bubble Sort', 'Insertion Sort', 'Quick Sort', 'Selection Sort'], correct_index: 2, explanation: 'Quick sort has O(n log n) average case, much better than the O(n²) alternatives listed.' },
    { quiz_id: quizzes[1]._id, question: 'The Fibonacci sequence can be computed in O(n) time using:', options: ['Recursion', 'Memoisation / DP', 'Divide and Conquer', 'Greedy'], correct_index: 1, explanation: 'Memoisation stores subproblem results, reducing the exponential naive recursion to O(n).' },
    // Quiz 2: OS
    { quiz_id: quizzes[2]._id, question: 'Which scheduling algorithm can cause starvation?', options: ['Round Robin', 'FCFS', 'Priority Scheduling', 'SRTF'], correct_index: 2, explanation: 'Priority Scheduling can starve low-priority processes if high-priority processes keep arriving.' },
    { quiz_id: quizzes[2]._id, question: 'A deadlock requires all four conditions: mutual exclusion, hold and wait, no preemption, and?', options: ['Synchronisation', 'Circular Wait', 'Context Switch', 'Page Fault'], correct_index: 1, explanation: 'Circular Wait — processes form a cycle where each waits for a resource held by the next.' },
    { quiz_id: quizzes[2]._id, question: 'What is thrashing in OS?', options: ['CPU executing too fast', 'Excessive paging causing performance degradation', 'Too many threads', 'Disk fragmentation'], correct_index: 1, explanation: 'Thrashing occurs when the OS spends more time swapping pages than executing processes.' },
    { quiz_id: quizzes[2]._id, question: 'Which page replacement algorithm is optimal but impractical?', options: ['LRU', 'FIFO', 'Optimal (OPT)', 'Clock'], correct_index: 2, explanation: 'OPT replaces the page not used for longest time in the future — requires future knowledge.' },
    { quiz_id: quizzes[2]._id, question: 'A process in the "waiting" state is:', options: ['Running on CPU', 'Ready to run', 'Waiting for I/O or event', 'Terminated'], correct_index: 2, explanation: 'A process moves to waiting state when it needs I/O or is waiting for a resource/event.' },
    // Quiz 3: DBMS
    { quiz_id: quizzes[3]._id, question: 'Which normal form eliminates transitive dependencies?', options: ['1NF', '2NF', '3NF', 'BCNF'], correct_index: 2, explanation: '3NF removes transitive dependencies — non-key attributes must depend only on the primary key.' },
    { quiz_id: quizzes[3]._id, question: 'ACID stands for:', options: ['Atomicity, Concurrency, Isolation, Durability', 'Atomicity, Consistency, Isolation, Durability', 'Accuracy, Consistency, Integrity, Durability', 'Atomicity, Consistency, Integration, Data'], correct_index: 1, explanation: 'ACID = Atomicity, Consistency, Isolation, Durability — properties ensuring reliable transactions.' },
    { quiz_id: quizzes[3]._id, question: 'Which JOIN returns only rows with matching values in both tables?', options: ['LEFT JOIN', 'RIGHT JOIN', 'FULL OUTER JOIN', 'INNER JOIN'], correct_index: 3, explanation: 'INNER JOIN returns only the intersection — rows that have matching values in both tables.' },
    { quiz_id: quizzes[3]._id, question: 'Which index structure is most efficient for range queries?', options: ['Hash Index', 'B-Tree Index', 'Bitmap Index', 'Clustered Index'], correct_index: 1, explanation: 'B-Tree indexes maintain sorted order, making range queries efficient with O(log n + k) cost.' },
    { quiz_id: quizzes[3]._id, question: 'What does the SQL HAVING clause do?', options: ['Filters individual rows', 'Sorts results', 'Filters groups after GROUP BY', 'Joins two tables'], correct_index: 2, explanation: 'HAVING filters aggregated groups — it is the GROUP BY equivalent of WHERE.' },
    // Quiz 4: Networks
    { quiz_id: quizzes[4]._id, question: 'Which layer of the OSI model handles IP addressing?', options: ['Data Link', 'Transport', 'Network', 'Physical'], correct_index: 2, explanation: 'The Network layer (Layer 3) handles logical IP addressing and routing between networks.' },
    { quiz_id: quizzes[4]._id, question: 'TCP is described as:', options: ['Connectionless and unreliable', 'Connection-oriented and reliable', 'Connectionless and reliable', 'Connection-oriented and unreliable'], correct_index: 1, explanation: 'TCP establishes a connection (3-way handshake) and guarantees reliable, ordered delivery.' },
    { quiz_id: quizzes[4]._id, question: 'What is the purpose of DNS?', options: ['Assign IP addresses', 'Translate domain names to IP addresses', 'Route packets', 'Encrypt traffic'], correct_index: 1, explanation: 'DNS resolves human-readable domain names (e.g. google.com) to machine-readable IP addresses.' },
    { quiz_id: quizzes[4]._id, question: 'Which protocol is used for sending emails?', options: ['HTTP', 'FTP', 'SMTP', 'POP3'], correct_index: 2, explanation: 'SMTP (Simple Mail Transfer Protocol) is used to send emails. POP3/IMAP are used to retrieve.' },
    { quiz_id: quizzes[4]._id, question: 'A subnet mask of /24 means:', options: ['24 bits for host, 8 for network', '8 bits for host, 24 for network', '24 hosts maximum', '24 subnets'], correct_index: 1, explanation: '/24 = 255.255.255.0 — 24 bits for network, 8 bits for hosts = 256 addresses (254 usable).' },
  ];
  const questions = await QuizQuestion.insertMany(questionsData);
  console.log(`  ✅ ${quizzes.length} quizzes + ${questions.length} questions inserted`);

  // Quiz Attempts (for student users)
  const attemptsData = [
    { quiz_id: quizzes[0]._id, user_id: byEmail['amit.student@campus.edu']._id, score: 4, total_questions: 5, percentage: 80, time_spent_seconds: 480, answers: [2, 1, 2, 3, 3] },
    { quiz_id: quizzes[1]._id, user_id: byEmail['amit.student@campus.edu']._id, score: 3, total_questions: 5, percentage: 60, time_spent_seconds: 720, answers: [1, 2, 2, 2, 1] },
    { quiz_id: quizzes[2]._id, user_id: byEmail['dev.student@campus.edu']._id, score: 5, total_questions: 5, percentage: 100, time_spent_seconds: 610, answers: [2, 1, 1, 2, 2] },
    { quiz_id: quizzes[0]._id, user_id: byEmail['ananya.student@campus.edu']._id, score: 5, total_questions: 5, percentage: 100, time_spent_seconds: 390, answers: [2, 1, 2, 3, 3] },
    { quiz_id: quizzes[3]._id, user_id: byEmail['dev.student@campus.edu']._id, score: 4, total_questions: 5, percentage: 80, time_spent_seconds: 890, answers: [2, 1, 3, 1, 2] },
    { quiz_id: quizzes[4]._id, user_id: byEmail['siddharth.student@campus.edu']._id, score: 4, total_questions: 5, percentage: 80, time_spent_seconds: 550, answers: [2, 1, 1, 2, 1] },
    { quiz_id: quizzes[1]._id, user_id: byEmail['rahul.student@campus.edu']._id, score: 2, total_questions: 5, percentage: 40, time_spent_seconds: 920, answers: [0, 2, 2, 2, 1] },
    { quiz_id: quizzes[0]._id, user_id: byEmail['arjun.senior@campus.edu']._id, score: 5, total_questions: 5, percentage: 100, time_spent_seconds: 210, answers: [2, 1, 2, 3, 3] },
  ];
  const attempts = await QuizAttempt.insertMany(attemptsData);
  console.log(`  ✅ ${attempts.length} quiz attempts inserted`);

  // ══════════════════════════════════════════════════════════════════════════
  // 7. HACKATHONS + REGISTRATIONS
  // ══════════════════════════════════════════════════════════════════════════
  console.log('🏆 Seeding hackathons…');
  const hackathonsData = [
    { user_id: byEmail['prof.sharma@campus.edu']._id, title: 'HackIndia 2025 — National Finals', description: 'India\'s largest student hackathon. 48 hours to build solutions for real-world problems in healthcare, education, and sustainability.', organizer: 'Google Developer Groups India', start_date: daysFromNow(12), end_date: daysFromNow(14), location: 'IIT Bombay, Mumbai', website_url: 'https://hackindia.com', prize: '₹5,00,000 + Internships', tags: ['AI', 'Healthcare', 'Sustainability', 'National'], max_team_size: 4, registration_count: 342 },
    { user_id: byEmail['dr.mehta@campus.edu']._id, title: 'Smart Campus Hackathon 2025', description: 'Build innovative solutions to improve the campus experience. Topics: student productivity, sustainability, accessibility.', organizer: 'MIT College of Engineering', start_date: daysFromNow(5), end_date: daysFromNow(6), location: 'MIT College Campus, Pune', website_url: 'https://smartcampus.mit.edu', prize: '₹50,000 + Certificates', tags: ['Campus', 'EdTech', 'IoT'], max_team_size: 3, registration_count: 89 },
    { user_id: byEmail['prof.sharma@campus.edu']._id, title: 'AI/ML Buildathon — Season 3', description: 'Create AI-powered applications using LLMs, computer vision, or predictive analytics. Best solutions get featured on ProductHunt.', organizer: 'DeepMind India & Nasscom', start_date: daysFromNow(21), end_date: daysFromNow(23), location: 'Online', website_url: 'https://aiml-buildathon.com', prize: '$5,000 + AWS Credits', tags: ['AI', 'ML', 'LLMs', 'Online'], max_team_size: 4, registration_count: 567 },
    { user_id: byEmail['dr.mehta@campus.edu']._id, title: 'Cybersecurity CTF Challenge', description: 'Capture the Flag competition. Categories: web exploitation, binary exploitation, cryptography, forensics, OSINT.', organizer: 'CDAC & CERT-In', start_date: daysFromNow(8), end_date: daysFromNow(9), location: 'Online', website_url: 'https://ctf.cdac.in', prize: '₹1,00,000 + Job Offers', tags: ['CTF', 'Security', 'Hacking', 'Online'], max_team_size: 2, registration_count: 234 },
    { user_id: byEmail['prof.sharma@campus.edu']._id, title: 'Open Source Sprint — FOSS India', description: 'Contribute to popular open source projects in a 36-hour sprint. Mentored by maintainers of Apache, Linux Foundation, and CNCF projects.', organizer: 'FOSS United', start_date: daysFromNow(30), end_date: daysFromNow(31), location: 'Bangalore', website_url: 'https://fossunited.org', prize: '₹75,000 + SWAG', tags: ['Open Source', 'FOSS', 'Contribution'], max_team_size: 2, registration_count: 156 },
    // Past hackathon
    { user_id: byEmail['dr.mehta@campus.edu']._id, title: 'Web Dev Sprint 2024', description: 'Build a full-stack web app in 24 hours.', organizer: 'College Tech Club', start_date: daysAgo(20), end_date: daysAgo(19), location: 'Online', website_url: '', prize: '₹25,000', tags: ['Web', 'Full Stack'], max_team_size: 3, registration_count: 78 },
  ];
  const hackathons = await Hackathon.insertMany(hackathonsData);

  const regsData = [
    { hackathon_id: hackathons[0]._id, user_id: byEmail['arjun.senior@campus.edu']._id, team_name: 'CodeCraft' },
    { hackathon_id: hackathons[0]._id, user_id: byEmail['priya.senior@campus.edu']._id, team_name: 'DataMinds' },
    { hackathon_id: hackathons[1]._id, user_id: byEmail['amit.student@campus.edu']._id, team_name: 'Campus Builders' },
    { hackathon_id: hackathons[1]._id, user_id: byEmail['sneha.student@campus.edu']._id, team_name: 'Campus Builders' },
    { hackathon_id: hackathons[2]._id, user_id: byEmail['arjun.senior@campus.edu']._id, team_name: 'NeuralNinjas' },
    { hackathon_id: hackathons[2]._id, user_id: byEmail['ananya.student@campus.edu']._id, team_name: 'DataWizards' },
    { hackathon_id: hackathons[3]._id, user_id: byEmail['neha.senior@campus.edu']._id, team_name: 'ByteBusters' },
    { hackathon_id: hackathons[5]._id, user_id: byEmail['dev.student@campus.edu']._id, team_name: 'WebWarriors' },
  ];
  const regs = await HackathonRegistration.insertMany(regsData);
  console.log(`  ✅ ${hackathons.length} hackathons + ${regs.length} registrations inserted`);

  // ══════════════════════════════════════════════════════════════════════════
  // 8. COMMUNITY POSTS + COMMENTS
  // ══════════════════════════════════════════════════════════════════════════
  console.log('💬 Seeding community posts…');
  const postsData = [
    { user_id: byEmail['arjun.senior@campus.edu']._id, title: 'How I got a Google STEP internship as a 2nd year student', content: 'Many people think STEP/internships are only for 3rd/4th year students. Here is my journey: I started competitive programming in semester 2, contributed to 3 open source projects, and cold-emailed 50 people on LinkedIn. The key was building in public — my GitHub was my resume. Happy to answer questions!', category: 'career', tags: ['Google', 'Internship', 'Success Story', 'CP'], upvotes: 89, downvotes: 2, comment_count: 12 },
    { user_id: byEmail['priya.senior@campus.edu']._id, title: 'Resources to learn Machine Learning from scratch in 2025', content: 'A lot of students ask me where to start with ML. Here is the path that worked for me:\n\n1. Python basics (2 weeks) — Python.org tutorial\n2. Math: Linear Algebra + Stats (Khan Academy)\n3. Andrew Ng ML Course (Coursera) — still the best\n4. Hands-On ML with Scikit-Learn (book)\n5. Kaggle micro-courses (free, practical)\n6. Build 3 projects, put on GitHub\n\nDM me if stuck!', category: 'academics', tags: ['ML', 'Learning Path', 'Resources', 'AI'], upvotes: 67, downvotes: 1, comment_count: 8 },
    { user_id: byEmail['vikram.senior@campus.edu']._id, title: 'AMA: DevOps career path — just got AWS SysOps cert', content: 'Just passed my AWS SysOps Administrator exam with 892/1000. Ask me anything about DevOps, cloud, certifications, or the job market. I also have resources for free/cheap cloud labs if anyone needs them.', category: 'career', tags: ['DevOps', 'AWS', 'Certification', 'AMA'], upvotes: 45, downvotes: 0, comment_count: 15 },
    { user_id: byEmail['prof.sharma@campus.edu']._id, title: 'Upcoming: DSA Workshop Series — Register Now', content: 'I am conducting a 6-week DSA workshop series every Saturday 10 AM–12 PM. Topics: Arrays & Strings, Linked Lists, Trees & Graphs, DP, and a mock interview session. Limited seats — 30 only. Comment below with your email to register. FREE for all students.', category: 'events', tags: ['DSA', 'Workshop', 'Free', 'Register'], upvotes: 124, downvotes: 0, comment_count: 31 },
    { user_id: byEmail['neha.senior@campus.edu']._id, title: 'Honest review: ICPC Asia Regionals experience', content: 'Just got back from ICPC Asia Regionals. The experience was incredible but tough. Here is my honest breakdown:\n\n✅ Level: Very hard — problems require expert-level knowledge\n✅ Team coordination is everything\n✅ Practice 2–3 hours daily for 6+ months\n❌ Do not go unprepared expecting to just "experience" it\n\nPractice on Codeforces rounds, ICPC notebook is must.', category: 'general', tags: ['ICPC', 'Competitive Programming', 'Contest'], upvotes: 56, downvotes: 1, comment_count: 7 },
    { user_id: byEmail['dev.student@campus.edu']._id, title: 'Looking for teammates for Smart Campus Hackathon', content: 'Participating in Smart Campus Hackathon next week. I have strong backend (Java Spring Boot + MongoDB) skills. Looking for 2 more people — ideally one frontend (React) and one hardware/IoT person. Our idea: Smart Room Booking System with occupancy detection. Reply below or DM!', category: 'general', tags: ['Hackathon', 'Team', 'Looking for Team', 'LFT'], upvotes: 23, downvotes: 0, comment_count: 9 },
    { user_id: byEmail['ananya.student@campus.edu']._id, title: 'My Kaggle journey: from beginner to Expert in 8 months', content: 'Started Kaggle in January with no ML knowledge. Got Expert rank in August. Here is what worked:\n1. Completed all micro-courses first\n2. Joined "getting started" competitions\n3. Read top notebooks carefully\n4. Joined Kaggle Discord for community\n5. Consistency — 1 hour daily\n\nCurrently working on my first silver medal. Happy to share my notebooks!', category: 'academics', tags: ['Kaggle', 'ML', 'Data Science', 'Journey'], upvotes: 38, downvotes: 0, comment_count: 6 },
    { user_id: byEmail['dr.mehta@campus.edu']._id, title: 'Important: Placement season timeline and preparation tips', content: 'Placement season starts in October. Key dates:\n\n📅 Pre-placement talks: September\n📅 Online tests: October 1–15\n📅 Technical interviews: October 15–31\n📅 HR rounds: November\n\nPreparation checklist:\n✅ DSA: 100+ LeetCode questions\n✅ System Design basics\n✅ DBMS, OS, Networks fundamentals\n✅ Project to discuss\n✅ Resume reviewed by faculty\n\nOffice hours for resume review: Thursday 3–5 PM, Room 204.', category: 'career', tags: ['Placement', 'Jobs', 'Preparation', 'Important'], upvotes: 156, downvotes: 0, comment_count: 24 },
  ];
  const posts = await CommunityPost.insertMany(postsData);

  const commentsData = [
    { post_id: posts[0]._id, user_id: byEmail['amit.student@campus.edu']._id, content: 'This is so inspiring! Which open source projects did you contribute to? Any beginner-friendly ones you recommend?' },
    { post_id: posts[0]._id, user_id: byEmail['rahul.student@campus.edu']._id, content: 'Incredible journey! How many hours per day did you spend on competitive programming?' },
    { post_id: posts[1]._id, user_id: byEmail['kiran.student@campus.edu']._id, content: 'Saving this! Starting my ML journey next week. Should I use PyTorch or TensorFlow for the deep learning part?' },
    { post_id: posts[1]._id, user_id: byEmail['ananya.student@campus.edu']._id, content: 'Great list! I would add: fast.ai is fantastic for practical DL. Their top-down approach makes it much faster to start.' },
    { post_id: posts[2]._id, user_id: byEmail['amit.student@campus.edu']._id, content: 'What is the best way to start with AWS if I have zero cloud experience? Free tier is enough to practice?' },
    { post_id: posts[3]._id, user_id: byEmail['sneha.student@campus.edu']._id, content: 'sneha.student@campus.edu — please register me! This is exactly what I need.' },
    { post_id: posts[3]._id, user_id: byEmail['pooja.student@campus.edu']._id, content: 'pooja.student@campus.edu — registering! Will the sessions be recorded for those who cannot attend live?' },
    { post_id: posts[5]._id, user_id: byEmail['sneha.student@campus.edu']._id, content: 'I can do React frontend! Sneha Kulkarni. DM me — I am in!' },
    { post_id: posts[5]._id, user_id: byEmail['harsh.student@campus.edu']._id, content: 'I can do the IoT/hardware part. I have Arduino and Raspberry Pi experience. Let us connect!' },
    { post_id: posts[7]._id, user_id: byEmail['dev.student@campus.edu']._id, content: 'Sir, when can we schedule resume reviews for students with Spring Boot projects? Thursday 3PM works!' },
    { post_id: posts[7]._id, user_id: byEmail['siddharth.student@campus.edu']._id, content: 'Sir, is there anything specific for mobile developers in placements? My apps are on Play Store.' },
  ];
  const comments = await CommunityComment.insertMany(commentsData);
  console.log(`  ✅ ${posts.length} posts + ${comments.length} comments inserted`);

  // ══════════════════════════════════════════════════════════════════════════
  // 9. MENTORSHIP REQUESTS
  // ══════════════════════════════════════════════════════════════════════════
  console.log('🤝 Seeding mentorship requests…');
  const mentorshipsData = [
    { junior_id: byEmail['amit.student@campus.edu']._id, senior_id: byEmail['arjun.senior@campus.edu']._id, message: 'Hi Arjun! I saw your Google internship post. I am a 2nd year CS student trying to break into software engineering. Would love mentorship on DSA and open source contributions.', status: 'accepted' },
    { junior_id: byEmail['kiran.student@campus.edu']._id, senior_id: byEmail['priya.senior@campus.edu']._id, message: 'Hi Priya! I am just starting with ML. Your resource post was very helpful. Can you guide me on which projects to build first?', status: 'accepted' },
    { junior_id: byEmail['sneha.student@campus.edu']._id, senior_id: byEmail['arjun.senior@campus.edu']._id, message: 'Hello! I am a 2nd year IT student learning React. I heard you built CampusSphere. Can you mentor me on frontend development?', status: 'pending' },
    { junior_id: byEmail['rahul.student@campus.edu']._id, senior_id: byEmail['neha.senior@campus.edu']._id, message: 'Hi Neha, I want to start competitive programming seriously. Your ICPC post was motivating. Can you suggest a study plan for beginners?', status: 'accepted' },
    { junior_id: byEmail['dev.student@campus.edu']._id, senior_id: byEmail['vikram.senior@campus.edu']._id, message: 'Hi Vikram! I want to transition from Java backend to DevOps/cloud. Can you guide me on the path to AWS certification?', status: 'pending' },
    { junior_id: byEmail['ananya.student@campus.edu']._id, senior_id: byEmail['priya.senior@campus.edu']._id, message: 'Hi! I am working on a Kaggle competition and stuck on feature engineering. You seem very experienced — could we have a 1-hour call?', status: 'rejected' },
    { junior_id: byEmail['pooja.student@campus.edu']._id, senior_id: byEmail['rohan.senior@campus.edu']._id, message: 'Hi Rohan! I am an ECE student interested in embedded systems and IoT. Could you mentor me on getting started with FPGA?', status: 'pending' },
  ];
  const mentorships = await MentorshipRequest.insertMany(mentorshipsData);
  console.log(`  ✅ ${mentorships.length} mentorship requests inserted`);

  // ══════════════════════════════════════════════════════════════════════════
  // 10. NOTIFICATIONS
  // ══════════════════════════════════════════════════════════════════════════
  console.log('🔔 Seeding notifications…');
  const notifsData = [
    { user_id: byEmail['amit.student@campus.edu']._id, type: 'note_approved', title: 'Your note was approved! 🎉', message: '"React Hooks Explained" has been approved and is now public.', is_read: false },
    { user_id: byEmail['amit.student@campus.edu']._id, type: 'mentorship_request', title: 'Mentorship accepted!', message: 'Arjun Kapoor accepted your mentorship request. You can now connect!', is_read: false },
    { user_id: byEmail['amit.student@campus.edu']._id, type: 'quiz_reminder', title: 'New quiz available: Algorithms & Complexity', message: 'Prof. Sharma added a new quiz. Test your knowledge!', is_read: true },
    { user_id: byEmail['amit.student@campus.edu']._id, type: 'hackathon', title: 'Hackathon deadline in 5 days!', message: 'Smart Campus Hackathon 2025 registration closes soon!', is_read: true },
    { user_id: byEmail['sneha.student@campus.edu']._id, type: 'community', title: 'Your team request got a reply!', message: 'Dev Malhotra replied to your comment in "Looking for teammates".', is_read: false },
    { user_id: byEmail['sneha.student@campus.edu']._id, type: 'note_approved', title: 'Note approved! 🎉', message: 'Your DSA notes have been approved.', is_read: false },
    { user_id: byEmail['arjun.senior@campus.edu']._id, type: 'mentorship_request', title: 'New mentorship request', message: 'Sneha Kulkarni sent you a mentorship request. Check it out!', is_read: false },
    { user_id: byEmail['arjun.senior@campus.edu']._id, type: 'community', title: 'Your post is trending! 🔥', message: '"How I got a Google STEP internship" has 89 upvotes!', is_read: true },
    { user_id: byEmail['priya.senior@campus.edu']._id, type: 'mentorship_request', title: 'New mentorship request', message: 'Kiran Desai sent you a mentorship request.', is_read: true },
    { user_id: byEmail['dev.student@campus.edu']._id, type: 'quiz_result', title: 'Quiz result: 100% on OS Concepts!', message: 'You scored perfectly on Operating Systems Concepts. +10 XP earned!', is_read: false },
    { user_id: byEmail['dev.student@campus.edu']._id, type: 'hackathon', title: 'Registered for hackathon!', message: 'You are registered for Web Dev Sprint 2024. Good luck!', is_read: true },
    { user_id: byEmail['rahul.student@campus.edu']._id, type: 'mentorship_request', title: 'Mentorship accepted!', message: 'Neha Singh accepted your mentorship request!', is_read: false },
    { user_id: byEmail['kiran.student@campus.edu']._id, type: 'mentorship_request', title: 'Mentorship accepted!', message: 'Priya Nair accepted your mentorship request!', is_read: false },
    { user_id: byEmail['prof.sharma@campus.edu']._id, type: 'note_pending', title: '2 notes pending approval', message: 'Rahul Gupta and Meera Pillai have submitted notes for review.', is_read: false },
    { user_id: byEmail['dr.mehta@campus.edu']._id, type: 'note_pending', title: '2 notes pending approval', message: 'Notes pending approval in the admin panel.', is_read: false },
    // Mock interview notifications (for Placement page)
    { user_id: byEmail['arjun.senior@campus.edu']._id, type: 'mock_interview', title: 'Tell me about yourself.', message: 'I am a final-year CS student at MIT College of Engineering, specialising in full-stack development. I have interned at Google as a STEP intern and built several production-grade projects including CampusSphere. I am passionate about scalable systems and open source.', link: '5' },
    { user_id: byEmail['arjun.senior@campus.edu']._id, type: 'mock_interview', title: 'What are your strengths and weaknesses?', message: 'Strength: I am a quick learner and strong problem solver — I can pick up new technologies fast. Weakness: I sometimes over-engineer solutions, but I have been working on shipping simpler MVPs first and iterating.', link: '4' },
    { user_id: byEmail['dev.student@campus.edu']._id, type: 'mock_interview', title: 'Describe a challenging project you worked on.', message: 'I built a microservices-based library system using Spring Boot. The biggest challenge was handling concurrent book reservations. I solved it using optimistic locking in JPA and a Redis cache to reduce DB load by 60%.', link: '4' },
  ];
  const notifs = await Notification.insertMany(notifsData);
  console.log(`  ✅ ${notifs.length} notifications inserted`);

  // ══════════════════════════════════════════════════════════════════════════
  // 11. ROADMAP PROGRESS (for senior and a few students)
  // ══════════════════════════════════════════════════════════════════════════
  console.log('🗂  Seeding roadmap progress…');
  const progressData = [
    // Arjun — Full Stack, mostly done
    { user_id: byEmail['arjun.senior@campus.edu']._id, career_key: 'full_stack', task_id: 'fs-1-1', status: 'completed' },
    { user_id: byEmail['arjun.senior@campus.edu']._id, career_key: 'full_stack', task_id: 'fs-1-2', status: 'completed' },
    { user_id: byEmail['arjun.senior@campus.edu']._id, career_key: 'full_stack', task_id: 'fs-1-3', status: 'completed' },
    { user_id: byEmail['arjun.senior@campus.edu']._id, career_key: 'full_stack', task_id: 'fs-2-1', status: 'completed' },
    { user_id: byEmail['arjun.senior@campus.edu']._id, career_key: 'full_stack', task_id: 'fs-2-2', status: 'completed' },
    { user_id: byEmail['arjun.senior@campus.edu']._id, career_key: 'full_stack', task_id: 'fs-2-3', status: 'completed' },
    { user_id: byEmail['arjun.senior@campus.edu']._id, career_key: 'full_stack', task_id: 'fs-3-1', status: 'in_progress' },
    { user_id: byEmail['arjun.senior@campus.edu']._id, career_key: 'full_stack', task_id: 'fs-3-2', status: 'not_started' },
    { user_id: byEmail['arjun.senior@campus.edu']._id, career_key: 'full_stack', task_id: 'fs-3-3', status: 'not_started' },
    // Priya — Data Science, phase 1 done
    { user_id: byEmail['priya.senior@campus.edu']._id, career_key: 'data_scientist', task_id: 'ds-1-1', status: 'completed' },
    { user_id: byEmail['priya.senior@campus.edu']._id, career_key: 'data_scientist', task_id: 'ds-1-2', status: 'completed' },
    { user_id: byEmail['priya.senior@campus.edu']._id, career_key: 'data_scientist', task_id: 'ds-1-3', status: 'completed' },
    { user_id: byEmail['priya.senior@campus.edu']._id, career_key: 'data_scientist', task_id: 'ds-2-1', status: 'completed' },
    { user_id: byEmail['priya.senior@campus.edu']._id, career_key: 'data_scientist', task_id: 'ds-2-2', status: 'in_progress' },
    { user_id: byEmail['priya.senior@campus.edu']._id, career_key: 'data_scientist', task_id: 'ds-2-3', status: 'not_started' },
    // Vikram — DevOps, full complete
    { user_id: byEmail['vikram.senior@campus.edu']._id, career_key: 'devops', task_id: 'do-1-1', status: 'completed' },
    { user_id: byEmail['vikram.senior@campus.edu']._id, career_key: 'devops', task_id: 'do-1-2', status: 'completed' },
    { user_id: byEmail['vikram.senior@campus.edu']._id, career_key: 'devops', task_id: 'do-1-3', status: 'completed' },
    { user_id: byEmail['vikram.senior@campus.edu']._id, career_key: 'devops', task_id: 'do-2-1', status: 'completed' },
    { user_id: byEmail['vikram.senior@campus.edu']._id, career_key: 'devops', task_id: 'do-2-2', status: 'completed' },
    { user_id: byEmail['vikram.senior@campus.edu']._id, career_key: 'devops', task_id: 'do-2-3', status: 'completed' },
    { user_id: byEmail['vikram.senior@campus.edu']._id, career_key: 'devops', task_id: 'do-3-1', status: 'completed' },
    { user_id: byEmail['vikram.senior@campus.edu']._id, career_key: 'devops', task_id: 'do-3-2', status: 'completed' },
    { user_id: byEmail['vikram.senior@campus.edu']._id, career_key: 'devops', task_id: 'do-3-3', status: 'in_progress' },
    // Amit — Full Stack, just starting
    { user_id: byEmail['amit.student@campus.edu']._id, career_key: 'full_stack', task_id: 'fs-1-1', status: 'completed' },
    { user_id: byEmail['amit.student@campus.edu']._id, career_key: 'full_stack', task_id: 'fs-1-2', status: 'in_progress' },
    // Ananya — Data Scientist, phase 1
    { user_id: byEmail['ananya.student@campus.edu']._id, career_key: 'data_scientist', task_id: 'ds-1-1', status: 'completed' },
    { user_id: byEmail['ananya.student@campus.edu']._id, career_key: 'data_scientist', task_id: 'ds-1-2', status: 'completed' },
    { user_id: byEmail['ananya.student@campus.edu']._id, career_key: 'data_scientist', task_id: 'ds-1-3', status: 'in_progress' },
  ];
  const progress = await RoadmapProgress.insertMany(progressData);
  console.log(`  ✅ ${progress.length} roadmap progress records inserted`);

  // ══════════════════════════════════════════════════════════════════════════
  // 12. RESUMES
  // ══════════════════════════════════════════════════════════════════════════
  console.log('📋 Seeding resumes…');
  const resumesData = [
    {
      user_id: byEmail['arjun.senior@campus.edu']._id,
      name: 'SDE Resume — Google Application',
      template: 'developer',
      data: {
        personal: { name: 'Arjun Kapoor', email: 'arjun.senior@campus.edu', phone: '+91 98765 43210', address: 'Pune, Maharashtra', linkedin: 'https://linkedin.com/in/arjun-kapoor', github: 'https://github.com/arjun-kapoor', portfolio: 'https://arjunkapoor.dev' },
        objective: 'Final-year Computer Science student with strong DSA skills and full-stack development experience. Google STEP intern. Seeking a full-time SDE role to build scalable products at impact.',
        education: [{ institution: 'MIT College of Engineering', degree: 'B.E.', field: 'Computer Science', start: '2021', end: '2025', gpa: '9.2' }],
        skills: ['React', 'Node.js', 'TypeScript', 'Python', 'System Design', 'DSA', 'MongoDB', 'AWS'],
        projects: [
          { title: 'CampusSphere', description: 'Full-stack academic platform for 10k+ students. React + Node.js + MongoDB. 99.9% uptime.', link: 'https://github.com/arjun-kapoor/campussphere', technologies: 'React, Node.js, MongoDB, Express, JWT' },
          { title: 'AlgoViz', description: 'Interactive algorithm visualiser with 30+ algorithms. 5k+ monthly users.', link: 'https://github.com/arjun-kapoor/algoviz', technologies: 'React, TypeScript, D3.js' },
        ],
        certifications: [{ title: 'Google Associate Cloud Engineer', issuer: 'Google', date: '2024-03' }],
        achievements: ['Google STEP Intern 2024', 'Hackathon Winner x3', 'LeetCode 2000+ rating'],
      },
    },
    {
      user_id: byEmail['dev.student@campus.edu']._id,
      name: 'Backend Developer Resume',
      template: 'professional',
      data: {
        personal: { name: 'Dev Malhotra', email: 'dev.student@campus.edu', phone: '+91 87654 32109', address: 'Mumbai, Maharashtra', linkedin: 'https://linkedin.com/in/dev-malhotra', github: 'https://github.com/dev-malhotra', portfolio: '' },
        objective: 'Backend developer with expertise in Java Spring Boot and microservices. Seeking internship to apply enterprise Java skills in production environment.',
        education: [{ institution: 'MIT College of Engineering', degree: 'B.E.', field: 'Information Technology', start: '2022', end: '2026', gpa: '8.5' }],
        skills: ['Java', 'Spring Boot', 'MongoDB', 'MySQL', 'REST APIs', 'Docker'],
        projects: [
          { title: 'Library Management System', description: 'Full CRUD API with Spring Boot, MySQL, JWT auth and role-based access control.', link: 'https://github.com/dev-malhotra/library-api', technologies: 'Java, Spring Boot, MySQL, JWT' },
          { title: 'Student Portal API', description: 'RESTful API for student data management with pagination and search.', link: 'https://github.com/dev-malhotra/student-portal', technologies: 'Spring Boot, MongoDB, Redis' },
        ],
        certifications: [{ title: 'Oracle Java SE 11', issuer: 'Oracle', date: '2024-06' }],
        achievements: ['Best Backend Project Award', 'Dean\'s List Semester 4'],
      },
    },
  ];
  const resumes = await Resume.insertMany(resumesData);
  console.log(`  ✅ ${resumes.length} resumes inserted`);

  // ══════════════════════════════════════════════════════════════════════════
  // FINAL SUMMARY
  // ══════════════════════════════════════════════════════════════════════════
  console.log('\n════════════════════════════════════════════════════');
  console.log('  🌱 SEED COMPLETE — Summary');
  console.log('════════════════════════════════════════════════════');
  console.log(`  Users             : ${users.length}  (2 faculty, 5 seniors, 10 students)`);
  console.log(`  Career Roadmaps   : ${roadmaps.length}`);
  console.log(`  Notes             : ${notes.length}  (10 approved, 2 pending)`);
  console.log(`  Resources         : ${resources.length}`);
  console.log(`  Doubts            : ${doubts.length}`);
  console.log(`  Doubt Answers     : ${answers.length}`);
  console.log(`  Quizzes           : ${quizzes.length}`);
  console.log(`  Quiz Questions    : ${questions.length}`);
  console.log(`  Quiz Attempts     : ${attempts.length}`);
  console.log(`  Hackathons        : ${hackathons.length}  (5 upcoming, 1 past)`);
  console.log(`  Hackathon Regs    : ${regs.length}`);
  console.log(`  Community Posts   : ${posts.length}`);
  console.log(`  Community Comments: ${comments.length}`);
  console.log(`  Mentorship Reqs   : ${mentorships.length}`);
  console.log(`  Notifications     : ${notifs.length}`);
  console.log(`  Roadmap Progress  : ${progress.length}`);
  console.log(`  Resumes           : ${resumes.length}`);
  console.log('════════════════════════════════════════════════════');
  console.log('');
  console.log('  🔑 Demo login credentials (password: password123)');
  console.log('  Faculty  : prof.sharma@campus.edu');
  console.log('  Faculty  : dr.mehta@campus.edu');
  console.log('  Senior   : arjun.senior@campus.edu');
  console.log('  Senior   : priya.senior@campus.edu');
  console.log('  Student  : amit.student@campus.edu');
  console.log('  Student  : dev.student@campus.edu');
  console.log('════════════════════════════════════════════════════\n');

  await mongoose.disconnect();
  process.exit(0);
}

main().catch((err) => {
  console.error('❌ Seed failed:', err);
  mongoose.disconnect();
  process.exit(1);
});
