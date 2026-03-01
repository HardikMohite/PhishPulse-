"""
Email utility for sending emails via Brevo (formerly Sendinblue) API.
Falls back to console logging if Brevo API key is not configured.
"""
import logging
import requests
from typing import Optional

from app.config import settings

logger = logging.getLogger(__name__)


def send_email_brevo(
    to_email: str,
    to_name: str,
    subject: str,
    html_body: str,
    text_body: Optional[str] = None
) -> bool:
    """
    Send an email using Brevo API.
    
    Args:
        to_email: Recipient email address
        to_name: Recipient name
        subject: Email subject
        html_body: HTML version of email body
        text_body: Plain text version (optional)
    
    Returns:
        True if sent successfully, False on error
    """
    
    # Check if Brevo is configured
    if not hasattr(settings, 'BREVO_API_KEY') or not settings.BREVO_API_KEY:
        logger.warning("Brevo API key not configured. Logging email to console.")
        logger.info("=" * 80)
        logger.info("📧 EMAIL (BREVO NOT CONFIGURED - LOGGING TO CONSOLE)")
        logger.info(f"To: {to_name} <{to_email}>")
        logger.info(f"Subject: {subject}")
        logger.info("-" * 80)
        logger.info(html_body if html_body else text_body)
        logger.info("=" * 80)
        return True
    
    # Prepare Brevo API request
    url = "https://api.brevo.com/v3/smtp/email"
    
    headers = {
        "accept": "application/json",
        "api-key": settings.BREVO_API_KEY,
        "content-type": "application/json"
    }
    
    payload = {
        "sender": {
            "name": "PhishPulse Security",
            "email": settings.FROM_EMAIL or "noreply@phishpulse.com"
        },
        "to": [
            {
                "email": to_email,
                "name": to_name
            }
        ],
        "subject": subject,
        "htmlContent": html_body
    }
    
    # Add text body if provided
    if text_body:
        payload["textContent"] = text_body
    
    try:
        response = requests.post(url, json=payload, headers=headers, timeout=10)
        
        if response.status_code == 201:
            logger.info(f"✅ Email sent successfully to {to_email} via Brevo")
            return True
        else:
            logger.error(f"❌ Brevo API error: {response.status_code} - {response.text}")
            # Fallback to console logging
            logger.info("📧 EMAIL (Brevo failed - logging to console)")
            logger.info(f"To: {to_name} <{to_email}>")
            logger.info(f"Subject: {subject}")
            logger.info(html_body if html_body else text_body)
            return False
            
    except Exception as e:
        logger.error(f"❌ Error sending email via Brevo: {str(e)}")
        # Fallback to console logging
        logger.info("📧 EMAIL (Error - logging to console)")
        logger.info(f"To: {to_name} <{to_email}>")
        logger.info(f"Subject: {subject}")
        logger.info(html_body if html_body else text_body)
        return False


def send_otp_email(to_email: str, otp_code: str, to_name: str = None) -> bool:
    """
    Send OTP verification email with a nice HTML template.
    
    Args:
        to_email: Recipient email address
        otp_code: 6-digit OTP code
        to_name: Recipient name (optional)
    
    Returns:
        True if sent successfully, False on error
    """
    
    # Use email username if name not provided
    if not to_name:
        to_name = to_email.split('@')[0]
    
    subject = "PhishPulse - Your Verification Code"
    
    # HTML email template
    html_body = f"""
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>PhishPulse - Verification Code</title>
</head>
<body style="margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #0a0a0f;">
    <table role="presentation" style="width: 100%; border-collapse: collapse;">
        <tr>
            <td align="center" style="padding: 40px 0;">
                <table role="presentation" style="width: 600px; border-collapse: collapse; background-color: #1a1a1f; border-radius: 12px; overflow: hidden;">
                    <!-- Header -->
                    <tr>
                        <td style="padding: 40px 40px 20px 40px; text-align: center; background: linear-gradient(135deg, rgba(6,182,212,0.1) 0%, rgba(6,182,212,0.05) 100%);">
                            <h1 style="margin: 0; color: #ffffff; font-size: 28px; font-weight: 600;">
                                <span style="color: #06b6d4;">🛡️</span> PhishPulse
                            </h1>
                            <p style="margin: 10px 0 0 0; color: #64748b; font-size: 14px;">Security Training Platform</p>
                        </td>
                    </tr>
                    
                    <!-- Content -->
                    <tr>
                        <td style="padding: 40px;">
                            <h2 style="margin: 0 0 20px 0; color: #ffffff; font-size: 24px; font-weight: 600;">
                                Verification Code
                            </h2>
                            <p style="margin: 0 0 30px 0; color: #94a3b8; font-size: 16px; line-height: 1.6;">
                                Hello <strong style="color: #ffffff;">{to_name}</strong>,
                            </p>
                            <p style="margin: 0 0 30px 0; color: #94a3b8; font-size: 16px; line-height: 1.6;">
                                Your verification code is:
                            </p>
                            
                            <!-- OTP Code Box -->
                            <table role="presentation" style="width: 100%; border-collapse: collapse; margin: 0 0 30px 0;">
                                <tr>
                                    <td align="center" style="padding: 30px; background-color: rgba(6,182,212,0.1); border: 2px solid #06b6d4; border-radius: 12px;">
                                        <span style="font-size: 48px; font-weight: bold; color: #06b6d4; letter-spacing: 8px; font-family: 'Courier New', monospace;">
                                            {otp_code}
                                        </span>
                                    </td>
                                </tr>
                            </table>
                            
                            <p style="margin: 0 0 20px 0; color: #94a3b8; font-size: 14px; line-height: 1.6;">
                                This code will expire in <strong style="color: #06b6d4;">5 minutes</strong>.
                            </p>
                            <p style="margin: 0 0 30px 0; color: #94a3b8; font-size: 14px; line-height: 1.6;">
                                If you didn't request this code, please ignore this email or contact support if you have concerns.
                            </p>
                            
                            <!-- Security Notice -->
                            <div style="padding: 20px; background-color: rgba(220,38,38,0.1); border-left: 4px solid #dc2626; border-radius: 8px;">
                                <p style="margin: 0; color: #f87171; font-size: 14px; line-height: 1.6;">
                                    <strong>🔒 Security Notice:</strong> Never share this code with anyone. PhishPulse will never ask for your verification code via phone or email.
                                </p>
                            </div>
                        </td>
                    </tr>
                    
                    <!-- Footer -->
                    <tr>
                        <td style="padding: 30px 40px; text-align: center; background-color: rgba(6,182,212,0.05); border-top: 1px solid rgba(6,182,212,0.2);">
                            <p style="margin: 0 0 10px 0; color: #64748b; font-size: 12px;">
                                PhishPulse - Cybersecurity Training Platform
                            </p>
                            <p style="margin: 0; color: #475569; font-size: 12px;">
                                This is an automated message, please do not reply.
                            </p>
                        </td>
                    </tr>
                </table>
            </td>
        </tr>
    </table>
</body>
</html>
    """
    
    # Plain text version
    text_body = f"""
PhishPulse - Verification Code

Hello {to_name},

Your verification code is: {otp_code}

This code will expire in 5 minutes.

If you didn't request this code, please ignore this email.

Security Notice: Never share this code with anyone.

---
PhishPulse - Cybersecurity Training Platform
    """
    
    return send_email_brevo(to_email, to_name, subject, html_body, text_body)


def send_password_reset_email(to_email: str, to_name: str, reset_link: str) -> bool:
    """
    Send password reset email.
    
    Args:
        to_email: Recipient email address
        to_name: Recipient name
        reset_link: Password reset link
    
    Returns:
        True if sent successfully, False on error
    """
    
    subject = "PhishPulse - Password Reset Request"
    
    html_body = f"""
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>PhishPulse - Password Reset</title>
</head>
<body style="margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #0a0a0f;">
    <table role="presentation" style="width: 100%; border-collapse: collapse;">
        <tr>
            <td align="center" style="padding: 40px 0;">
                <table role="presentation" style="width: 600px; border-collapse: collapse; background-color: #1a1a1f; border-radius: 12px; overflow: hidden;">
                    <tr>
                        <td style="padding: 40px 40px 20px 40px; text-align: center; background: linear-gradient(135deg, rgba(6,182,212,0.1) 0%, rgba(6,182,212,0.05) 100%);">
                            <h1 style="margin: 0; color: #ffffff; font-size: 28px; font-weight: 600;">
                                <span style="color: #06b6d4;">🛡️</span> PhishPulse
                            </h1>
                        </td>
                    </tr>
                    <tr>
                        <td style="padding: 40px;">
                            <h2 style="margin: 0 0 20px 0; color: #ffffff; font-size: 24px;">Password Reset Request</h2>
                            <p style="margin: 0 0 20px 0; color: #94a3b8; font-size: 16px;">
                                Hello <strong style="color: #ffffff;">{to_name}</strong>,
                            </p>
                            <p style="margin: 0 0 30px 0; color: #94a3b8; font-size: 16px;">
                                We received a request to reset your password. Click the button below to reset it:
                            </p>
                            <table role="presentation" style="margin: 0 0 30px 0;">
                                <tr>
                                    <td style="border-radius: 8px; background-color: #06b6d4;">
                                        <a href="{reset_link}" style="display: inline-block; padding: 16px 32px; color: #ffffff; text-decoration: none; font-weight: 600; font-size: 16px;">
                                            Reset Password
                                        </a>
                                    </td>
                                </tr>
                            </table>
                            <p style="margin: 0 0 20px 0; color: #94a3b8; font-size: 14px;">
                                This link will expire in <strong style="color: #06b6d4;">1 hour</strong>.
                            </p>
                            <p style="margin: 0; color: #64748b; font-size: 14px;">
                                If you didn't request this, please ignore this email.
                            </p>
                        </td>
                    </tr>
                </table>
            </td>
        </tr>
    </table>
</body>
</html>
    """
    
    text_body = f"""
PhishPulse - Password Reset Request

Hello {to_name},

We received a request to reset your password.

Reset your password by visiting this link:
{reset_link}

This link will expire in 1 hour.

If you didn't request this, please ignore this email.

---
PhishPulse - Cybersecurity Training Platform
    """
    
    return send_email_brevo(to_email, to_name, subject, html_body, text_body)
