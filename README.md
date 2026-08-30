# CampusSphere

A full-stack academic platform that connects students, senior students, and faculty in one ecosystem. Built with React, Node.js, Express, and MongoDB Atlas.

---

## Features

### Role-Based Dashboards
Three separate dashboards based on user role — each showing only relevant tools and data.

| Role | Dashboard Highlights |
|---|---|
| **Student** | XP & level tracker, quiz results, upcoming hackathons, leaderboard, recent notes |
| **Senior Student** | Mentorship requests, shared notes stats, student discovery, community posts |
| **Faculty / Admin** | Pending note approvals, user management, platform analytics, content moderation |

### Core Modules

- **Notes Sharing** — Upload, approve, like, and download academic notes with subject/branch filters
- **Study Resources** — Faculty-curated chapter notes, PYQs, important questions, and reference materials
- **Doubt Discussion** — Post doubts, answer peers, vote on answers, mark best answer
- **Quiz System** — MCQ quizzes with instant results, XP rewards, and attempt history
- **Career Roadmap** — Structured 90-day learning paths for 4 career tracks with progress tracking
- **Resume Builder** — Live-preview resume editor with 6 templates and PDF export
- **Placement Prep** — Aptitude, technical, coding, and mock interview practice with history
- **Hackathons** — Discover, register for, and manage hackathon events
- **Networking** — Find seniors and faculty, send mentorship requests
- **Community Forum** — Discussion posts with categories, voting, and comments
- **Notifications** — Real-time notification centre for approvals, requests, and events

---

## Tech Stack

### Frontend
| Technology | Version | Purpose |
|---|---|---|
| React | 18.3 | UI framework |
| TypeScript | 5.5 | Type safety |
| Vite | 5.4 | Build tool & dev server |
| React Router | 7 | Client-side routing |
| Tailwind CSS | 3.4 | Styling |
| shadcn/ui + Radix UI | — | Component library |
| Axios | 1.7 | HTTP client |
| Recharts | 2.12 | Charts & analytics |
| Lucide React | 0.446 | Icons |
| Zustand | 5 | State management |
| React Hook Form + Zod | — | Form validation |

### Backend
| Technology | Version | Purpose |
|---|---|---|
| Node.js | 20+ | Runtime |
| Express | 4.19 | Web framework |
| MongoDB Atlas | — | Database |
| Mongoose | 8.5 | ODM |
| JWT (jsonwebtoken) | 9 | Authentication |
| bcryptjs | 2.4 | Password hashing |
| CORS | 2.8 | Cross-origin requests |
| dotenv | 16.4 | Environment variables |
| nodemon | 3.1 | Dev auto-restart |

---

## Project Structure

```
CampusSphere/
│
├── backend/                      # Express API server
│   ├── config/
│   │   └── db.js                 # MongoDB connection (with Google DNS fix)
│   ├── controllers/
│   │   └── authController.js     # Signup, login, /me
│   ├── middleware/
│   │   └── authMiddleware.js     # JWT protect + requireFaculty
│   ├── models/
│   │   ├── User.js               # User schema (all roles)
│   │   ├── Note.js               # Notes collection
│   │   ├── Resource.js           # Study resources
│   │   ├── Doubt.js              # Doubts + answers
│   │   ├── Quiz.js               # Quizzes, questions, attempts
│   │   ├── Hackathon.js          # Hackathons + registrations
│   │   ├── Community.js          # Posts + comments
│   │   └── Misc.js               # Mentorship, notifications,
│   │                             # roadmap progress, resumes,
│   │                             # career roadmaps, user-notes
│   ├── routes/
│   │   ├── authRoutes.js
│   │   ├── userRoutes.js
│   │   ├── noteRoutes.js
│   │   ├── resourceRoutes.js
│   │   ├── doubtRoutes.js
│   │   ├── quizRoutes.js
│   │   ├── hackathonRoutes.js
│   │   ├── communityRoutes.js
│   │   ├── networkingRoutes.js
│   │   ├── roadmapRoutes.js
│   │   ├── resumeRoutes.js
│   │   ├── notificationRoutes.js
│   │   └── adminRoutes.js
│   ├── seed.js                   # Demo data seed script
│   ├── server.js                 # Entry point
│   ├── package.json
│   ├── .env                      # Backend secrets (never committed)
│   └── .env.example              # Safe template
│
├── src/                          # React frontend
│   ├── components/
│   │   ├── Layout.tsx            # App shell with sidebar
│   │   ├── Sidebar.tsx
│   │   ├── PageHeader.tsx
│   │   ├── NotificationsMenu.tsx
│   │   └── ui/                   # shadcn/ui components
│   ├── lib/
│   │   ├── api.ts                # Axios instance (Vite proxy)
│   │   ├── auth.tsx              # AuthContext + JWT handling
│   │   ├── types.ts              # TypeScript interfaces
│   │   ├── constants.ts          # Shared constants & helpers
│   │   └── utils.ts
│   ├── pages/
│   │   ├── Auth.tsx              # Login + Register (single page)
│   │   ├── Dashboard.tsx         # Role-based dashboard router
│   │   ├── Notes.tsx
│   │   ├── Resources.tsx
│   │   ├── Doubts.tsx
│   │   ├── Quizzes.tsx
│   │   ├── ResumeBuilder.tsx
│   │   ├── Roadmap.tsx
│   │   ├── Placement.tsx
│   │   ├── Hackathons.tsx
│   │   ├── Networking.tsx
│   │   ├── Community.tsx
│   │   ├── Profile.tsx
│   │   └── Admin.tsx
│   ├── App.tsx                   # Routes + auth guards
│   └── main.tsx
│
├── .env                          # Frontend env (VITE_API_URL)
├── .env.example
├── .gitignore
├── vite.config.ts                # Vite + /api proxy to :5000
├── tailwind.config.js
├── tsconfig.json
└── package.json
```

---

## Getting Started

### Prerequisites

- Node.js 20+
- npm 10+
- MongoDB Atlas account (free tier works)

### 1. Clone the repository

```bash
git clone https://github.com/your-username/campus-sphere.git
cd campus-sphere
```

### 2. Configure backend environment

```bash
cd backend
cp .env.example .env
```

Edit `backend/.env`:

```env
PORT=5000
NODE_ENV=development
MONGO_URI=mongodb+srv://<username>:<password>@cluster0.xxxxx.mongodb.net/campusDB?appName=Cluster0
JWT_SECRET=your_strong_random_secret_here
CLIENT_URL=http://localhost:5173
```

> **MongoDB Atlas setup:** Go to [cloud.mongodb.com](https://cloud.mongodb.com) → Network Access → Add IP Address → Allow access from anywhere (`0.0.0.0/0`) for development.

### 3. Configure frontend environment

```bash
cd ..
cp .env.example .env
```

The default `.env` works out of the box for development — leave `VITE_API_URL` empty so the Vite proxy handles routing:

```env
VITE_API_URL=
```

### 4. Install dependencies

```bash
# Frontend dependencies
npm install

# Backend dependencies
cd backend
npm install
```

### 5. Seed the database (optional but recommended)

Populates MongoDB with realistic demo data — 17 users across all 3 roles, notes, quizzes, hackathons, community posts, roadmaps, and more.

```bash
cd backend
node seed.js
```

### 6. Start the application

Open **two terminals**:

**Terminal 1 — Backend:**
```bash
cd backend
npm run dev
```

Expected output:
```
Server running on port 5000
✅ MongoDB connected: ac-xxxxx.mongodb.net
```

**Terminal 2 — Frontend:**
```bash
npm run dev
```

Expected output:
```
VITE v5.4.8  ready in ~1s
➜  Local:   http://localhost:5173/
```

Open **[http://localhost:5173](http://localhost:5173)** in your browser.

---

## Demo Accounts

After running the seed script, use these credentials to explore all three dashboards:

| Role | Email | Password |
|---|---|---|
| Faculty / Admin | `prof.sharma@campus.edu` | `password123` |
| Faculty / Admin | `dr.mehta@campus.edu` | `password123` |
| Senior Student | `arjun.senior@campus.edu` | `password123` |
| Senior Student | `priya.senior@campus.edu` | `password123` |
| Student | `amit.student@campus.edu` | `password123` |
| Student | `dev.student@campus.edu` | `password123` |

---

## API Reference

### Authentication
| Method | Endpoint | Auth | Description |
|---|---|---|---|
| POST | `/api/auth/signup` | Public | Register a new user |
| POST | `/api/auth/login` | Public | Login and get JWT |
| GET | `/api/auth/me` | Required | Get current user |

### Core Resources
| Method | Endpoint | Auth | Description |
|---|---|---|---|
| GET | `/api/notes` | Required | List approved notes |
| POST | `/api/notes` | Required | Upload a note |
| POST | `/api/notes/:id/like` | Required | Toggle like |
| POST | `/api/notes/:id/download` | Required | Increment download count |
| GET | `/api/resources` | Required | List study resources |
| POST | `/api/resources` | Faculty | Add a resource |
| GET | `/api/doubts` | Required | List doubts |
| POST | `/api/doubts` | Required | Post a doubt |
| GET | `/api/doubts/:id/answers` | Required | Get answers |
| POST | `/api/doubts/:id/answers` | Required | Post an answer |

### Quizzes
| Method | Endpoint | Auth | Description |
|---|---|---|---|
| GET | `/api/quizzes` | Required | List active quizzes |
| GET | `/api/quizzes/:id/questions` | Required | Get quiz questions |
| POST | `/api/quizzes/attempts` | Required | Submit quiz attempt |
| GET | `/api/quizzes/attempts/mine` | Required | My attempt history |
| POST | `/api/quizzes` | Faculty | Create a quiz |

### Community & Networking
| Method | Endpoint | Auth | Description |
|---|---|---|---|
| GET | `/api/community/posts` | Required | List forum posts |
| POST | `/api/community/posts` | Required | Create a post |
| POST | `/api/community/posts/:id/comments` | Required | Add a comment |
| POST | `/api/community/posts/:id/vote` | Required | Upvote / downvote |
| GET | `/api/users` | Required | List users (networking) |
| GET | `/api/users/leaderboard` | Required | XP leaderboard |
| POST | `/api/networking/requests` | Required | Send mentorship request |

### Admin (Faculty only)
| Method | Endpoint | Auth | Description |
|---|---|---|---|
| GET | `/api/admin/stats` | Faculty | Platform statistics |
| GET | `/api/admin/pending-notes` | Faculty | Notes awaiting approval |
| PATCH | `/api/admin/notes/:id/approve` | Faculty | Approve note (+20 XP) |
| PATCH | `/api/admin/notes/:id/reject` | Faculty | Reject note |
| PATCH | `/api/admin/users/:id/role` | Faculty | Change user role |
| DELETE | `/api/admin/posts/:id` | Faculty | Delete a post |

### Health Check
| Method | Endpoint | Auth | Description |
|---|---|---|---|
| GET | `/api/health` | Public | Server status |

---

## Authentication Flow

```
User submits login form
        ↓
POST /api/auth/login (via Vite proxy)
        ↓
Express finds user in MongoDB
        ↓
bcryptjs.compare(password, hash)
        ↓
jwt.sign({ id }, JWT_SECRET, { expiresIn: '30d' })
        ↓
{ token, user } returned to frontend
        ↓
localStorage.setItem('token', token)
        ↓
AuthContext sets session + profile state
        ↓
React Router redirects to /dashboard
        ↓
Dashboard renders role-specific view
```

Protected routes check `AuthContext.session`. If no session, React Router redirects to `/login`. The JWT is sent as `Authorization: Bearer <token>` on every API request via the Axios interceptor.

---

## MongoDB Collections

| Collection | Description | Key Fields |
|---|---|---|
| `users` | All platform users | role, email, password (hashed), xp, skills |
| `notes` | Uploaded academic notes | status (pending/approved/rejected), downloads, likes |
| `resources` | Faculty study materials | resource_type, external_url |
| `doubts` | Student questions | answer_count, best_answer_id |
| `doubtanswers` | Answers to doubts | is_best, upvotes |
| `quizzes` | Quiz definitions | difficulty, duration_minutes, is_active |
| `quizquestions` | MCQ questions | options[], correct_index |
| `quizattempts` | User quiz results | score, percentage, answers[] |
| `hackathons` | Hackathon events | start_date, prize, registration_count |
| `hackathonregistrations` | Event signups | hackathon_id, user_id |
| `communityposts` | Forum posts | category, upvotes, comment_count |
| `communitycomments` | Post comments | post_id, content |
| `mentorshiprequests` | Mentor connections | junior_id, senior_id, status |
| `notifications` | User notifications | type, is_read |
| `careerroadmaps` | Career path data | career_key, phases[] |
| `roadmapprogresses` | User task progress | task_id, status |
| `resumes` | Built resumes | template, data (nested JSON) |

---

## Environment Variables

### `backend/.env`

```env
PORT=5000
NODE_ENV=development
MONGO_URI=mongodb+srv://username:password@cluster.mongodb.net/campusDB
JWT_SECRET=your_strong_secret_key
CLIENT_URL=http://localhost:5173
```

### `.env` (frontend root)

```env
# Leave empty in development — Vite proxy handles /api/* → localhost:5000
# Set to deployed backend URL in production
VITE_API_URL=
```

> Never commit `.env` files. Both are listed in `.gitignore`.

---

## How the Vite Proxy Works

In development, all API calls from the browser go to `localhost:5173/api/*`. Vite's dev server proxy silently forwards these to `localhost:5000/api/*` on the server side — so the browser never makes a cross-origin request and CORS is never an issue.

```
Browser → localhost:5173/api/auth/login
              ↓ (Vite proxy, server-side)
        localhost:5000/api/auth/login
```

In production, set `VITE_API_URL=https://your-api.com` and configure CORS on the backend to allow your frontend domain.

---

## Scripts

### Frontend (root)
```bash
npm run dev          # Start Vite dev server on :5173
npm run build        # TypeScript check + production build
npm run preview      # Preview production build on :4173
npm run typecheck    # TypeScript type check only
npm run lint         # ESLint
```

### Backend (`backend/`)
```bash
npm run dev          # Start with nodemon (auto-restart)
npm start            # Start with node (production)
node seed.js         # Seed database with demo data
```

---

## XP & Gamification

Users earn XP for platform activity:

| Action | XP Earned |
|---|---|
| Note approved by admin | +20 XP |
| Quiz completed | +10 XP |
| Roadmap task completed | +15 XP |
| Hackathon registered | +50 XP |

Level is calculated as `Math.floor(xp / 100) + 1`. A leaderboard on the student dashboard ranks users by XP.

---

## License

MIT License — free to use, modify, and distribute.

---

## Author

Built by **Harshal** — a full-stack academic platform for the next generation of campus learners.
