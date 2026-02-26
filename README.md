# 🛡️ PhishPulse Beta v1.0

> AI-Enhanced Cybersecurity Awareness Training Platform — *Build Your Human Firewall*

---

## 📌 Overview

PhishPulse is a gamified cybersecurity training platform that teaches employees to identify and respond to phishing attacks through interactive vaults, live incident simulations, and an RPG-style progression system.

**Beta v1.0 includes:**
- Secure authentication with 2FA
- 5 training vaults across 4 difficulty tiers
- AI-generated incident simulations via Groq
- XP, coins, levels, and title system
- SOC (Security Operations Center) interface
- Admin analytics dashboard
- Developer console

---

## 🚀 Getting Started

### Prerequisites

- Node.js v18+
- Python 3.10+
- Git

### Frontend Setup

```bash
cd frontend
npm install
npm run dev
```

Runs on `http://localhost:5173`

### Backend Setup

```bash
cd backend
python -m venv venv

# Mac/Linux
source venv/bin/activate

# Windows
venv\Scripts\activate

pip install -r requirements.txt
uvicorn app.main:app --reload
```

Runs on `http://localhost:8000`  
API docs at `http://localhost:8000/docs`

### Environment Variables

```bash
# Backend
cp backend/.env.example backend/.env
# Fill in your values
```

**Never commit `.env` to GitHub.**

---

## 🛠️ Tech Stack

### Frontend
| Tool | Purpose |
|------|---------|
| React + TypeScript | UI framework |
| Vite | Build tool |
| TailwindCSS | Styling |
| shadcn/ui | UI components |
| Framer Motion | Animations |
| Zustand | State management |
| Axios | API calls |
| React Router DOM | Routing |
| Lottie React | Complex animations |

### Backend
| Tool | Purpose |
|------|---------|
| FastAPI | API framework |
| PostgreSQL / SQLite | Database |
| SQLAlchemy | ORM |
| Alembic | Migrations |
| JWT + httpOnly Cookies | Authentication |
| Groq API | AI email generation |
| Passlib (bcrypt) | Password hashing |

---

## 📁 Project Structure

```
phishpulse/
├── frontend/
│   └── src/
│       ├── app/                    → Router and layout
│       ├── pages/
│       │   ├── auth/               → Login, Register, 2FA
│       │   ├── dashboard/          → Main dashboard
│       │   ├── vault-realm/        → Vault screens
│       │   ├── incident-gate/      → Gate and selection
│       │   ├── soc-interface/      → SOC and resolution
│       │   ├── profile/            → Profile and titles
│       │   ├── admin/              → Admin and developer
│       │   └── settings/           → Settings
│       ├── components/
│       │   ├── ui/                 → Base UI elements
│       │   ├── animations/         → Animation components
│       │   ├── vault/              → Vault components
│       │   ├── incident/           → Incident components
│       │   └── layout/             → Layout components
│       ├── store/                  → Zustand state
│       ├── services/               → API calls
│       ├── constants/              → Config values
│       └── utils/                  → Helper functions
│
└── backend/
    └── app/
        ├── models/                 → Database models
        ├── schemas/                → Pydantic schemas
        ├── routers/                → API endpoints
        ├── services/               → Business logic
        ├── core/                   → Auth and security
        └── utils/                  → Helpers
```

---

## 🎮 Features

### Authentication
- Email + password registration and login
- SMS-based 2FA verification
- JWT with httpOnly cookies
- Persistent sessions
- Role-based routing — Employee / Admin / Developer

### Vault Mode
5 training vaults covering real phishing scenarios:
1. Basic Email Phishing *(Beginner)*
2. Spear Phishing *(Intermediate)*
3. Link Manipulation — URL Analysis *(Advanced)*
4. Smishing — SMS Phishing *(Intermediate)*
5. CEO Fraud / Whaling *(Expert)*

- Replayable — 100% rewards first completion, 50% on replay
- Health system — lose health on wrong answers
- Coin-based hint system

### Incident Mode
- SOC (Security Operations Center) interface
- Live countdown timer with pressure mechanics
- AI-generated phishing emails via Groq
- Two severity levels in Beta — L1 and L2
- Real-world consequence framing on failure

### Unlock Requirements
**L1 Incidents:** Complete 5 vaults + Level 3 + 500 coins  
**L2 Incidents:** Complete all vaults + Level 5 + 1500 coins + 3 L1 resolved + 70% accuracy

### Progression System
- XP and leveling
- Coin economy
- Daily login streaks with increasing rewards
- 4 titles in Beta with gameplay buffs:

| Title | Buff |
|-------|------|
| First Step 🔰 | +5% Vault XP |
| Awakened Novice ⚡ | +10% Vault Coins |
| First Responder 🚨 | +5% Incident Integrity |
| Vault Specialist ⚔️ | +10% Incident XP |

---

## 🎨 Design System

```
Colors:
  Background:   #0a0a0f
  Secondary:    #0d1117
  Purple:       #7c3aed
  Blue:         #3b82f6
  Danger:       #dc2626
  Gold:         #f59e0b
  Text:         #f8fafc

Fonts:
  UI:           Inter
  Terminal:     JetBrains Mono
```

---

## 🔐 Access Levels

| Role | Access |
|------|--------|
| Employee | Training platform — vaults, incidents, profile |
| Admin | Analytics dashboard, campaign creator |
| Developer | Console — user management, feature flags, logs |

---

## 📋 Git Workflow

- **Never push directly to `main`**
- Create a feature branch for every task
- Branch naming: `feature/screen-name` or `fix/issue-name`
- PR required for all merges into main
- CodeRabbit automatically reviews every PR

---

## 🚫 Not In Beta

The following are planned for the full version and are **not** included in Beta v1.0:

- Leaderboards
- Email phishing campaigns
- Enterprise analytics
- Certificates
- Multiplayer / team challenges
- Mobile APK
- Real SSO (Google / Microsoft)
- All 100 vaults

---

## 📦 Scripts

```bash
# Frontend
npm run dev          # Start dev server
npm run build        # Production build
npm run test         # Run tests

# Backend
uvicorn app.main:app --reload    # Start dev server
pytest                           # Run tests
alembic upgrade head             # Run migrations
```

---

*PhishPulse Beta v1.0 — Building Human Firewalls* 🛡️