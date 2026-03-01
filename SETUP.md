# 🛡️ PhishPulse - Setup Guide

A comprehensive guide to set up and run the PhishPulse cyber defense training platform.

---

## 📋 Table of Contents

- [Prerequisites](#prerequisites)
- [Installation](#installation)
- [Configuration](#configuration)
- [Running the Application](#running-the-application)
- [Troubleshooting](#troubleshooting)
- [Project Structure](#project-structure)
- [Available Scripts](#available-scripts)

---

## 🔧 Prerequisites

Before you begin, ensure you have the following installed on your system:

### Required Software

1. **Python 3.11+**
   - Download: https://www.python.org/downloads/
   - Verify installation: `python --version` or `python3 --version`

2. **Node.js 18+ and npm**
   - Download: https://nodejs.org/ (LTS version recommended)
   - Verify installation:
     ```bash
     node --version
     npm --version
     ```

3. **Git**
   - Download: https://git-scm.com/downloads
   - Verify installation: `git --version`

4. **Code Editor** (Recommended)
   - Visual Studio Code: https://code.visualstudio.com/

---

## 📥 Installation

### 1. Clone the Repository

```bash
git clone <repository-url>
cd PhishPulse
```

### 2. Backend Setup

#### Step 1: Navigate to Backend Directory

```bash
cd backend
```

#### Step 2: Create Virtual Environment

**Windows (PowerShell):**
```powershell
python -m venv venv
.\venv\Scripts\Activate.ps1
```

**Windows (Command Prompt):**
```cmd
python -m venv venv
venv\Scripts\activate.bat
```

**Mac/Linux:**
```bash
python3 -m venv venv
source venv/bin/activate
```

#### Step 3: Install Python Dependencies

```bash
pip install --upgrade pip
pip install -r requirements.txt
```

**Required packages will include:**
- fastapi
- uvicorn
- sqlalchemy
- pydantic
- python-jose
- passlib
- bcrypt
- python-multipart
- requests
- python-dotenv

### 3. Frontend Setup

#### Step 1: Navigate to Frontend Directory

```bash
cd ../frontend
```

#### Step 2: Install Node Dependencies

```bash
npm install
```

**This will install all required packages including:**
- react
- react-router-dom
- framer-motion
- lucide-react
- axios
- zustand
- tailwindcss
- typescript
- vite

---

## ⚙️ Configuration

### Backend Configuration

#### 1. Environment Variables

Create a `.env` file in the `backend` directory:

```bash
cd backend
```

Copy the `.env.example` or create a new `.env` file:

```env
# Local development environment variables
SECRET_KEY=dev-secret-key-change-in-production-min-32-chars-required
ALGORITHM=HS256

# JWT Token Expiry Settings
ACCESS_TOKEN_EXPIRE_DAYS=1
REMEMBER_ME_EXPIRE_DAYS=30

# App Settings
APP_NAME=PhishPulse API
DEBUG=True
API_V1_PREFIX=/api

# Frontend URL
FRONTEND_URL=http://localhost:5173

# Database
DATABASE_URL=sqlite:///./phishpulse.db

# Email Settings (Brevo)
FROM_EMAIL=phishpulse5@gmail.com
BREVO_API_KEY=your-brevo-api-key-here
```

#### 2. Database Setup

The SQLite database will be created automatically on first run.

**To reset the database:**
```powershell
# Stop the backend server first (Ctrl+C)
Remove-Item "phishpulse.db" -Force
# Restart the server - database will be recreated
```

### Frontend Configuration

The frontend uses environment variables for API configuration.

Create `.env` file in the `frontend` directory (optional):

```env
VITE_API_URL=http://localhost:8000
```

---

## 🚀 Running the Application

### Method 1: Using Startup Scripts (Recommended)

#### Start Backend

**Windows:**
```powershell
cd backend
.\start.ps1
```

**Mac/Linux:**
```bash
cd backend
chmod +x start.sh
./start.sh
```

#### Start Frontend (In a new terminal)

```bash
cd frontend
npm run dev
```

### Method 2: Manual Start

#### Start Backend Manually

1. Open terminal and navigate to backend:
   ```bash
   cd backend
   ```

2. Activate virtual environment:
   ```powershell
   # Windows PowerShell
   .\venv\Scripts\Activate.ps1
   
   # Mac/Linux
   source venv/bin/activate
   ```

3. Start the server:
   ```bash
   python -m uvicorn app.main:app --reload --port 8000
   ```

   Or using the start script:
   ```bash
   uvicorn app.main:app --reload --port 8000
   ```

#### Start Frontend Manually

1. Open a **new terminal** and navigate to frontend:
   ```bash
   cd frontend
   ```

2. Start the development server:
   ```bash
   npm run dev
   ```

---

## 🌐 Access the Application

After starting both servers:

- **Frontend (User Interface):** http://localhost:5173
- **Backend API:** http://localhost:8000
- **API Documentation (Swagger):** http://localhost:8000/docs
- **API Documentation (ReDoc):** http://localhost:8000/redoc

### Default Test Account

After first registration, you can create test accounts:

- **Email:** test@example.com
- **Password:** Test@123
- **Phone:** +1234567890

---

## 🐛 Troubleshooting

### Common Issues

#### 1. Port Already in Use

**Backend (Port 8000):**
```powershell
# Windows - Find and kill process
netstat -ano | findstr :8000
taskkill /PID <PID> /F

# Mac/Linux
lsof -ti:8000 | xargs kill -9
```

**Frontend (Port 5173):**
```powershell
# Windows
netstat -ano | findstr :5173
taskkill /PID <PID> /F

# Mac/Linux
lsof -ti:5173 | xargs kill -9
```

#### 2. Module Not Found Errors

**Backend:**
```bash
cd backend
.\venv\Scripts\Activate.ps1  # Activate venv first
pip install -r requirements.txt
```

**Frontend:**
```bash
cd frontend
rm -rf node_modules package-lock.json  # Clean install
npm install
```

#### 3. Database Lock Error

```powershell
# Stop backend server (Ctrl+C)
cd backend
Remove-Item "phishpulse.db" -Force
# Restart server
```

#### 4. CORS Errors

Ensure `FRONTEND_URL` in backend `.env` matches your frontend URL:
```env
FRONTEND_URL=http://localhost:5173
```

#### 5. Email/OTP Not Received

- Check `BREVO_API_KEY` is set correctly in `.env`
- Verify sender email (`FROM_EMAIL`) is verified in Brevo
- Check spam folder
- OTP code is also printed in backend console for testing

#### 6. Virtual Environment Not Activating (Windows)

If you get execution policy error:
```powershell
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
```

---

## 📁 Project Structure

```
PhishPulse/
├── backend/                 # FastAPI backend
│   ├── app/
│   │   ├── main.py         # FastAPI app entry point
│   │   ├── config.py       # Configuration settings
│   │   ├── database.py     # Database connection
│   │   ├── models/         # SQLAlchemy models
│   │   ├── routers/        # API routes
│   │   ├── services/       # Business logic
│   │   ├── schemas/        # Pydantic schemas
│   │   └── utils/          # Utility functions
│   ├── venv/               # Virtual environment
│   ├── requirements.txt    # Python dependencies
│   ├── .env                # Environment variables
│   ├── start.ps1          # Windows startup script
│   └── phishpulse.db      # SQLite database (auto-created)
│
├── frontend/               # React + TypeScript frontend
│   ├── src/
│   │   ├── pages/         # Page components
│   │   ├── components/    # Reusable components
│   │   ├── services/      # API services
│   │   ├── store/         # State management (Zustand)
│   │   ├── App.tsx        # Main app component
│   │   └── main.tsx       # Entry point
│   ├── public/            # Static assets
│   ├── package.json       # Node dependencies
│   ├── vite.config.ts     # Vite configuration
│   └── tsconfig.json      # TypeScript configuration
│
└── SETUP.md               # This file
```

---

## 📜 Available Scripts

### Backend Scripts

```bash
# Start development server
python -m uvicorn app.main:app --reload

# Start with specific host/port
uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload

# Run without reload (production-like)
uvicorn app.main:app
```

### Frontend Scripts

```bash
# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview

# Lint code
npm run lint

# Type check
npm run type-check
```

---

## 🔐 Security Notes

### For Development:

- ✅ Use the provided `SECRET_KEY` (it's secure enough for dev)
- ✅ `DEBUG=True` is enabled
- ✅ SQLite database for easy setup
- ✅ CORS is configured for localhost

### For Production:

- ⚠️ Generate a strong `SECRET_KEY`
- ⚠️ Set `DEBUG=False`
- ⚠️ Use PostgreSQL or MySQL
- ⚠️ Configure proper CORS origins
- ⚠️ Use environment variables for secrets
- ⚠️ Enable HTTPS
- ⚠️ Set up proper authentication

---

## 🧪 Testing the Setup

### 1. Test Backend API

Open http://localhost:8000 in your browser. You should see:
```json
{
  "app": "PhishPulse API",
  "status": "running",
  "debug": true
}
```

### 2. Test API Documentation

Visit http://localhost:8000/docs to see interactive API documentation.

### 3. Test Frontend

1. Go to http://localhost:5173
2. You should see the PhishPulse login/register page
3. Try registering a new account
4. Check backend console for OTP code
5. Complete 2FA verification
6. Access the dashboard

---

## 🤝 Team Collaboration

### Git Workflow

1. **Pull latest changes:**
   ```bash
   git pull origin main
   ```

2. **Create a feature branch:**
   ```bash
   git checkout -b feature/your-feature-name
   ```

3. **Commit your changes:**
   ```bash
   git add .
   git commit -m "Description of changes"
   ```

4. **Push to remote:**
   ```bash
   git push origin feature/your-feature-name
   ```

5. **Create a Pull Request** on GitHub

### Code Standards

- **Backend:** Follow PEP 8 (Python style guide)
- **Frontend:** Use TypeScript strict mode
- **Commits:** Write clear, descriptive commit messages
- **Testing:** Test your changes before committing

---

## 📞 Support

If you encounter any issues:

1. Check the [Troubleshooting](#troubleshooting) section
2. Check backend console for error messages
3. Check browser console (F12) for frontend errors
4. Contact the team lead
5. Create an issue in the repository

---

## 📝 Quick Start Checklist

- [ ] Python 3.11+ installed
- [ ] Node.js 18+ installed
- [ ] Repository cloned
- [ ] Backend virtual environment created
- [ ] Backend dependencies installed
- [ ] Backend `.env` file configured
- [ ] Frontend dependencies installed
- [ ] Backend server running (port 8000)
- [ ] Frontend server running (port 5173)
- [ ] Can access http://localhost:5173
- [ ] Can register a new account
- [ ] Received OTP (email or console)
- [ ] Can log in to dashboard

---

## 🎉 You're All Set!

Your PhishPulse development environment is ready. Happy coding! 🚀

For questions or contributions, reach out to the development team.

**PhishPulse** - Empowering Cyber Defense Through Gamified Training
