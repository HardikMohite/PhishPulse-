# Email Configuration Guide for PhishPulse

## Current Status

**Development Mode:** ✅ Active (SMTP_ENABLED=False)
- Password reset links are logged to backend console
- No actual emails are sent
- Perfect for local development and testing

**Production Mode:** ⏳ Not Configured (requires SMTP setup)
- Real emails will be sent when SMTP_ENABLED=True

---

## Development Mode (Current - No Setup Needed)

When `SMTP_ENABLED=False` in `.env`:

1. User requests password reset
2. Backend generates reset link
3. **Link is printed to backend terminal** (check console output)
4. Copy the link from logs and paste in browser
5. User can reset password

Example console output:
```
================================================================================
📧 EMAIL (SMTP NOT CONFIGURED - LOGGING TO CONSOLE)
To: user@example.com
Subject: PhishPulse - Password Reset Request
--------------------------------------------------------------------------------
[Full email HTML with reset link]
http://localhost:5173/auth/reset-password?token=eyJ0eXA...
================================================================================
```

---

## Production SMTP Setup

### Option 1: Gmail (Recommended for Small Scale)

#### Step 1: Enable 2-Factor Authentication on Gmail
1. Go to https://myaccount.google.com/security
2. Enable "2-Step Verification"

#### Step 2: Generate App Password
1. Go to https://myaccount.google.com/apppasswords
2. Select "Mail" and "Other (Custom name)"
3. Enter "PhishPulse Backend"
4. Click "Generate"
5. **Copy the 16-character password** (no spaces)

#### Step 3: Update `.env`
```bash
SMTP_ENABLED=True
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASSWORD=your-16-char-app-password
FROM_EMAIL=your-email@gmail.com
```

#### Step 4: Restart Backend
```powershell
# Stop backend (Ctrl+C)
# Start again
uvicorn main:app --reload --port 8000
```

#### Gmail Limits:
- **Free:** ~500 emails/day
- **Google Workspace:** ~2,000 emails/day

---

### Option 2: SendGrid (Recommended for Production)

#### Step 1: Sign Up
1. Go to https://signup.sendgrid.com/
2. Free tier: 100 emails/day forever

#### Step 2: Create API Key
1. Go to Settings → API Keys
2. Click "Create API Key"
3. Name: "PhishPulse"
4. Permissions: "Full Access" or "Mail Send"
5. **Copy the API key** (only shown once)

#### Step 3: Update `.env`
```bash
SMTP_ENABLED=True
SMTP_HOST=smtp.sendgrid.net
SMTP_PORT=587
SMTP_USER=apikey
SMTP_PASSWORD=your-sendgrid-api-key-here
FROM_EMAIL=noreply@yourdomain.com
```

#### SendGrid Limits:
- **Free:** 100 emails/day
- **Essentials ($15/mo):** 40,000 emails/month
- **Pro ($90/mo):** 120,000 emails/month

---

### Option 3: AWS SES (Best for Large Scale)

#### Step 1: Sign Up for AWS
1. Go to https://aws.amazon.com/ses/
2. Navigate to SES Console

#### Step 2: Verify Email/Domain
1. Go to "Verified identities"
2. Create identity → Email address
3. Verify your from-address via email

#### Step 3: Get SMTP Credentials
1. Go to "SMTP Settings"
2. Click "Create SMTP credentials"
3. **Download credentials file**

#### Step 4: Request Production Access
1. By default, SES is in "sandbox mode" (can only send to verified emails)
2. Request production access: https://console.aws.amazon.com/support/home

#### Step 5: Update `.env`
```bash
SMTP_ENABLED=True
SMTP_HOST=email-smtp.us-east-1.amazonaws.com
SMTP_PORT=587
SMTP_USER=your-ses-smtp-username
SMTP_PASSWORD=your-ses-smtp-password
FROM_EMAIL=noreply@yourdomain.com
```

#### AWS SES Pricing:
- **First 62,000 emails/month:** Free (if sent from EC2)
- **Additional:** $0.10 per 1,000 emails

---

### Option 4: Mailgun

#### Step 1: Sign Up
1. Go to https://signup.mailgun.com/
2. Free trial: 5,000 emails for 3 months

#### Step 2: Add Domain or Use Sandbox
1. Use sandbox domain for testing
2. Add your own domain for production

#### Step 3: Get SMTP Credentials
1. Go to "Sending" → "Domain settings"
2. Click "SMTP credentials"
3. Create new SMTP user

#### Step 4: Update `.env`
```bash
SMTP_ENABLED=True
SMTP_HOST=smtp.mailgun.org
SMTP_PORT=587
SMTP_USER=postmaster@your-mailgun-domain
SMTP_PASSWORD=your-mailgun-password
FROM_EMAIL=noreply@your-mailgun-domain
```

---

## Testing SMTP Configuration

### 1. Test via Python Script

Create `test_email.py` in backend folder:

```python
from app.utils.email import send_password_reset_email

# Test password reset email
result = send_password_reset_email(
    email="your-test-email@gmail.com",
    reset_token="test-token-123"
)

if result:
    print("✅ Email sent successfully!")
else:
    print("❌ Failed to send email")
```

Run:
```powershell
cd backend
.\venv\Scripts\Activate.ps1
python test_email.py
```

### 2. Test via API

```powershell
# Register a user (if needed)
curl -X POST http://localhost:8000/api/auth/register `
  -H "Content-Type: application/json" `
  -d '{\"email\":\"test@example.com\",\"password\":\"Test123\",\"name\":\"Test\",\"phone\":\"+1234567890\"}'

# Trigger forgot password
curl -X POST http://localhost:8000/api/auth/forgot-password `
  -H "Content-Type: application/json" `
  -d '{\"email\":\"test@example.com\"}'
```

Check:
- If `SMTP_ENABLED=False`: Check backend console for link
- If `SMTP_ENABLED=True`: Check your inbox

---

## Troubleshooting

### Error: "Authentication failed"
**Solution:** 
- Gmail: Use App Password, not regular password
- Check username/password are correct
- Ensure 2FA is enabled (for Gmail)

### Error: "Connection refused"
**Solution:**
- Check SMTP_HOST and SMTP_PORT
- Verify firewall allows outbound port 587
- Try port 465 (SSL) or 25 if 587 blocked

### Emails go to spam
**Solution:**
- Verify your sending domain (SPF, DKIM, DMARC records)
- Use a verified domain instead of Gmail
- Avoid spam trigger words in subject/body

### Gmail: "Less secure app access"
**Solution:**
- Don't use "Allow less secure apps" (deprecated)
- Use App Passwords instead (requires 2FA)

---

## Email Templates

The backend includes two email templates:

### 1. Password Reset Email
- **Trigger:** User clicks "Forgot Password"
- **Contains:** Reset link valid for 30 minutes
- **Template:** `app/utils/email.py` → `send_password_reset_email()`

### 2. Verification Code Email  
- **Trigger:** User registers (if email verification enabled)
- **Contains:** 6-digit code valid for 10 minutes
- **Template:** `app/utils/email.py` → `send_verification_email()`

### Customizing Templates

Edit `backend/app/utils/email.py` to change:
- Email design (HTML/CSS)
- Email copy
- Expiration times
- Button styles

---

## Switching Between Dev and Production

### Development (No Real Emails)
```bash
SMTP_ENABLED=False
```

### Production (Send Real Emails)
```bash
SMTP_ENABLED=True
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASSWORD=your-app-password
FROM_EMAIL=noreply@phishpulse.com
```

**Restart backend after changing `.env`**

---

## Recommended Setup by Scale

| Users | Recommended Service | Why |
|-------|---------------------|-----|
| Development | Console logging (current) | Free, no setup |
| < 500 emails/day | Gmail App Password | Easy setup, free |
| 500-10K emails/day | SendGrid Free → Essentials | Reliable, good free tier |
| 10K-100K emails/day | AWS SES | Best pricing, scalable |
| 100K+ emails/day | AWS SES or SendGrid Pro | Enterprise features |

---

## Next Steps

1. **For Development:** ✅ No action needed - keep using console logs
2. **For Testing:** Set up Gmail with App Password
3. **For Production:** Choose SendGrid or AWS SES
4. **For Custom Domain:** Add SPF, DKIM, DMARC DNS records

---

## Summary

✅ **Current:** SMTP disabled, emails logged to console  
📝 **Quick Setup:** Gmail App Password (5 minutes)  
🚀 **Production:** SendGrid or AWS SES  
📧 **Test:** Forgot password feature works in dev mode  

No immediate action required - the system works without SMTP! 🎉
