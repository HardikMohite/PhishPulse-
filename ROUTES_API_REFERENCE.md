# PhishPulse - Routes & API Endpoints Reference

## Frontend Routes (React Router)

### Public Routes
- **/** → `HubPage` - Landing page with "Enter Command Center" button
- **/auth/login** → `LoginPage` - User login form
- **/auth/register** → `RegisterPage` - New user registration
- **/auth/forgot-password** → `ForgotPasswordPage` - Request password reset
- **/auth/2fa** → `TwoFactorPage` - 2FA verification

### Protected Routes (to be added)
- **/dashboard** - Main dashboard (after login)

---

## Backend API Endpoints

**Base URL:** `http://localhost:8000/api`

### Authentication Endpoints

#### POST /auth/register
Register a new user.

**Request:**
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "phone": "+1234567890",
  "password": "SecurePassword123"
}
```

**Response:**
```json
{
  "message": "Registration successful. Please verify your phone number.",
  "userId": "user_123",
  "phone": "+1234567890"
}
```

---

#### POST /auth/login
Login with email and password. Sets httpOnly cookie with access token.

**Request:**
```json
{
  "email": "john@example.com",
  "password": "SecurePassword123",
  "remember_me": true
}
```

**Response:**
```json
{
  "message": "Login successful.",
  "user": {
    "id": "user_123",
    "email": "john@example.com",
    "name": "John Doe",
    "phone": "+1234567890"
  },
  "userId": "user_123"
}
```

---

#### POST /auth/verify-otp
Verify 2FA OTP code.

**Request:**
```json
{
  "user_id": "user_123",
  "code": "123456"
}
```

**Response:**
```json
{
  "message": "OTP verified successfully.",
  "access_token": "jwt_token_here"
}
```

---

#### POST /auth/resend-otp
Resend OTP code to user's phone.

**Request:**
```json
{
  "user_id": "user_123"
}
```

**Response:**
```json
{
  "message": "OTP resent successfully."
}
```

---

#### POST /auth/forgot-password
Request password reset. Sends reset link/token.

**Request:**
```json
{
  "email": "john@example.com"
}
```

**Response:**
```json
{
  "message": "If an account exists, a reset link has been sent."
}
```

---

#### POST /auth/reset-password
Reset password using token from forgot-password email.

**Request:**
```json
{
  "token": "reset_token_from_email",
  "new_password": "NewSecurePassword123"
}
```

**Response:**
```json
{
  "message": "Password reset successful."
}
```

---

#### POST /auth/logout
Logout user and clear session cookie.

**Response:**
```json
{
  "message": "Logged out successfully."
}
```

---

#### GET /auth/me
Get current authenticated user info. Requires authentication cookie.

**Response:**
```json
{
  "id": "user_123",
  "email": "john@example.com",
  "name": "John Doe",
  "phone": "+1234567890",
  "is_verified": true
}
```

---

## Frontend Auth Service Usage

Import and use the auth service in your React components:

```typescript
import { 
  login, 
  register, 
  verifyOtp, 
  logout, 
  forgotPassword, 
  resetPassword 
} from '@/services/authService';

// Login
await login({
  email: 'john@example.com',
  password: 'password123',
  rememberMe: true
});

// Register
await register({
  name: 'John Doe',
  email: 'john@example.com',
  phone: '+1234567890',
  password: 'password123',
  confirmPassword: 'password123'
});

// Verify OTP
await verifyOtp({
  userId: 'user_123',
  code: '123456'
});

// Logout
await logout();

// Forgot Password
await forgotPassword('john@example.com');

// Reset Password
await resetPassword('reset_token', 'new_password123');
```

---

## Navigation Flow

```
1. User visits / (HubPage)
   ↓
2. Clicks "Enter Command Center"
   ↓
3. Navigates to /auth/login
   ↓
4. User can:
   - Login → /dashboard
   - Go to Register → /auth/register
   - Forgot Password → /auth/forgot-password
   ↓
5. After Register → /auth/2fa
   ↓
6. After 2FA → /auth/login
   ↓
7. After Login → /dashboard
```

---

## Testing Checklist

### Frontend Routes
- [ ] / loads HubPage with particle animation
- [ ] "Enter Command Center" navigates to /auth/login
- [ ] /auth/login shows login form
- [ ] /auth/register shows registration form
- [ ] /auth/forgot-password shows forgot password form
- [ ] /auth/2fa shows 2FA verification form

### API Endpoints (use curl or Postman)
- [ ] POST /api/auth/register creates new user
- [ ] POST /api/auth/login returns user data
- [ ] POST /api/auth/verify-otp verifies code
- [ ] POST /api/auth/logout clears session
- [ ] POST /api/auth/forgot-password logs reset link
- [ ] POST /api/auth/reset-password changes password
- [ ] GET /api/auth/me returns current user (with cookie)

### Integration Tests
- [ ] Register → receive userId → 2FA page
- [ ] 2FA → enter code → redirect to login
- [ ] Login → dashboard (after implementing dashboard)
- [ ] Logout → clear session → redirect to /
- [ ] Forgot password → check backend logs for reset link
- [ ] Reset password → login with new password works

---

## Environment Variables

### Frontend (.env or .env.local)
```bash
VITE_API_URL=http://localhost:8000/api
```

### Backend (.env)
```bash
SECRET_KEY=your-secret-key-min-32-chars
DATABASE_URL=sqlite:///./phishpulse.db
FRONTEND_URL=http://localhost:5173
API_V1_PREFIX=/api
ACCESS_TOKEN_EXPIRE_MINUTES=15
REFRESH_TOKEN_EXPIRE_DAYS=7
```

---

## Quick Start Commands

### Start Backend
```powershell
cd backend
.\start.ps1
```
Or manually:
```powershell
cd backend
.\venv\Scripts\Activate.ps1
uvicorn main:app --reload --port 8000
```

### Start Frontend
```powershell
npm run dev --prefix frontend
```

### View API Docs
http://localhost:8000/docs

---

## Common Issues & Solutions

### Issue: CORS errors
**Solution:** Verify `FRONTEND_URL` in backend `.env` matches your dev server (http://localhost:5173)

### Issue: 404 on API calls
**Solution:** Check `VITE_API_URL` includes `/api` suffix: `http://localhost:8000/api`

### Issue: Eye/EyeOff icon error
**Solution:** ✅ Fixed - Added import to LoginPage

### Issue: Duplicate export errors
**Solution:** ✅ Fixed - Removed duplicate functions in authService.ts

### Issue: Routes not working
**Solution:** Ensure router.tsx is imported in main.tsx and RouterProvider is used

---

**All routes and API endpoints are now configured and ready for testing!** 🚀
