# ⚡ PrepForge — Interview Preparation Platform

A complete MERN stack interview prep platform covering Aptitude, DSA, HR/GD rounds and Feedback.

---

## 📁 Project Structure

```
interview-prep/
├── backend/                  ← Express + MongoDB API
│   ├── models/
│   │   ├── User.js           ← User schema (bcrypt hashed passwords)
│   │   └── Progress.js       ← Per-user scores for all sections
│   ├── routes/
│   │   ├── auth.js           ← POST /register, POST /login, GET /me
│   │   ├── aptitude.js       ← GET /questions, POST /submit
│   │   ├── dsa.js            ← GET /questions, POST /complete
│   │   ├── interview.js      ← GET /questions, POST /submit (grammar scoring)
│   │   └── progress.js       ← GET / (full dashboard), DELETE /reset
│   ├── middleware/
│   │   └── auth.js           ← JWT protect middleware
│   ├── server.js             ← Main Express app
│   ├── .env.example          ← Environment variables template
│   └── package.json
│
└── frontend/                 ← React app
    ├── src/
    │   ├── context/
    │   │   └── AuthContext.js ← Global auth state + JWT storage
    │   ├── components/
    │   │   ├── Navbar.js      ← Responsive navbar with auth links
    │   │   └── Timer.js       ← Reusable countdown timer (pause/resume)
    │   ├── pages/
    │   │   ├── Landing.js     ← Landing page with 4 feature sections
    │   │   ├── Login.js       ← Login + Register pages
    │   │   ├── Dashboard.js   ← Progress overview, weak area detection
    │   │   ├── Aptitude.js    ← 10 MCQ questions, must answer correctly to proceed
    │   │   ├── DSA.js         ← 10 GFG problems, Mark as Done flow
    │   │   ├── Interview.js   ← Essay answers with grammar scoring
    │   │   └── Feedback.js    ← Full score breakdown + tips
    │   ├── App.js             ← Routes + protected route logic
    │   └── App.css            ← Global design system (dark futuristic theme)
    └── package.json
```

---

## 🚀 Setup Instructions

### Prerequisites
- Node.js (v16+)
- MongoDB (local install or MongoDB Atlas free cluster)
- npm

---

### 1. Backend Setup

```bash
cd interview-prep/backend
npm install
```

Create a `.env` file (copy from `.env.example`):
```bash
cp .env.example .env
```

Edit `.env`:
```
MONGO_URI=mongodb://localhost:27017/interview_prep
JWT_SECRET=your_super_secret_key_here_change_this
PORT=5000
```

> 💡 For MongoDB Atlas, replace MONGO_URI with your Atlas connection string.

Start the backend:
```bash
npm run dev     # development (nodemon)
# or
npm start       # production
```

Backend runs on: `http://localhost:5000`

---

### 2. Frontend Setup

```bash
cd interview-prep/frontend
npm install
npm start
```

Frontend runs on: `http://localhost:3000`

> The `"proxy": "http://localhost:5000"` in `package.json` routes API calls automatically.

---

## 🗄️ Database Schema

### Users Collection
```js
{
  name: String,
  email: String (unique),
  password: String (bcrypt hashed),
  createdAt: Date
}
```

### Progress Collection
```js
{
  userId: ObjectId (ref: User),
  aptitude: { score, total, completed[], attempts },
  dsa: { score, total, completed[], attempts },
  interview: { score, total, completed[], submissions[] },
  overallScore: Number,
  lastUpdated: Date
}
```

---

## 🔌 API Endpoints

### Auth
| Method | URL | Description |
|--------|-----|-------------|
| POST | /api/auth/register | Register new user, creates progress doc |
| POST | /api/auth/login | Login, returns JWT token |
| GET | /api/auth/me | Get current user (protected) |

### Aptitude
| Method | URL | Description |
|--------|-----|-------------|
| GET | /api/aptitude/questions | Get 10 MCQ questions (no answers) |
| POST | /api/aptitude/submit | Submit answer, get result + explanation |

### DSA
| Method | URL | Description |
|--------|-----|-------------|
| GET | /api/dsa/questions | Get 10 DSA problems with GFG links |
| POST | /api/dsa/complete | Mark question as done |

### Interview
| Method | URL | Description |
|--------|-----|-------------|
| GET | /api/interview/questions | Get 10 HR/GD/Technical questions |
| POST | /api/interview/submit | Submit answer, returns grammar score + feedback |

### Progress
| Method | URL | Description |
|--------|-----|-------------|
| GET | /api/progress | Get full progress for current user |
| DELETE | /api/progress/reset | Reset all progress |

---

## ✨ Features Implemented (70%)

- ✅ **Landing Page** — Hero, 4 feature sections, how-it-works, CTA
- ✅ **Auth** — Register, Login with JWT, protected routes
- ✅ **Navbar** — Responsive, active state, auth-aware
- ✅ **Dashboard** — Progress cards, overall score, weak areas
- ✅ **Aptitude** — 10 MCQ questions, answer validation, must be correct to proceed, timer
- ✅ **DSA** — 10 GFG problem links, Mark as Done, topic/difficulty badges, timer
- ✅ **Interview/GD** — Essay answers, grammar scoring, word/sentence analysis, feedback, timer
- ✅ **Feedback** — Score breakdown, grades, improvement tips, weak area detection
- ✅ **Timers** — On every section (pause/resume), visual warning/danger states
- ✅ **Progress persistence** — MongoDB saves all scores per user

---

## 🔮 Planned (30% — AI Co-Pilot)

- 🤖 Aptitude hints on demand (directional, not full answer)
- 🤖 DSA nudges via AI (hints without full solution)
- 🤖 Grammar + vocabulary suggestions in real-time for Interview/GD
- 🤖 Personalized study plan based on scores

---

## 🎨 Tech Stack

| Layer | Tech |
|-------|------|
| Frontend | React 18, React Router v6, Axios |
| Styling | Custom CSS (dark futuristic theme), Google Fonts |
| Backend | Node.js, Express.js |
| Database | MongoDB, Mongoose |
| Auth | JWT (jsonwebtoken), bcryptjs |
| Dev | nodemon, dotenv |
