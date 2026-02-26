"""
Email utility for sending emails via SMTP.
Falls back to console logging if SMTP is not configured.
"""
import smtplib
import logging
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from typing import Optional

from app.config import settings

logger = logging.getLogger(__name__)


def send_email(
    to_email: str,
    subject: str,
    html_body: str,
    text_body: Optional[str] = None
) -> bool:
    """
    Send an email. If SMTP is not configured, log the email to console instead.
    
    Args:
        to_email: Recipient email address
        subject: Email subject
        html_body: HTML version of email body
        text_body: Plain text version (optional, defaults to stripped HTML)
    
    Returns:
        True if sent successfully (or logged in dev mode), False on error
    """
    
    # Development mode - just log to console
    if not settings.SMTP_ENABLED:
        logger.info("=" * 80)
        logger.info("📧 EMAIL (SMTP NOT CONFIGURED - LOGGING TO CONSOLE)")
        logger.info(f"To: {to_email}")
        logger.info(f"Subject: {subject}")
        logger.info("-" * 80)
        logger.info(html_body if html_body else text_body)
        logger.info("=" * 80)
        return True
    
    # Production mode - send via SMTP
    try:
        msg = MIMEMultipart('alternative')
        msg['Subject'] = subject
        msg['From'] = settings.FROM_EMAIL
        msg['To'] = to_email
        
        # Attach text and HTML versions
        if text_body:
            part1 = MIMEText(text_body, 'plain')
            msg.attach(part1)
        
        if html_body:
            part2 = MIMEText(html_body, 'html')
            msg.attach(part2)
        
        # Connect to SMTP server
        with smtplib.SMTP(settings.SMTP_HOST, settings.SMTP_PORT) as server:
            server.starttls()
            server.login(settings.SMTP_USER, settings.SMTP_PASSWORD)
            server.send_message(msg)
        
        logger.info(f"✅ Email sent successfully to {to_email}")
        return True
        
    except Exception as e:
        logger.error(f"❌ Failed to send email to {to_email}: {str(e)}")
        return False


def send_password_reset_email(email: str, reset_token: str) -> bool:
    """
    Send password reset email with reset link.
    
    Args:
        email: User's email address
        reset_token: Password reset token
    
    Returns:
        True if sent/logged successfully
    """
    reset_url = f"{settings.FRONTEND_URL}/auth/reset-password?token={reset_token}"
    
    subject = "PhishPulse - Password Reset Request"
    
    html_body = f"""
    <!DOCTYPE html>
    <html>
    <head>
        <style>
            body {{ font-family: Arial, sans-serif; line-height: 1.6; color: #333; }}
            .container {{ max-width: 600px; margin: 0 auto; padding: 20px; }}
            .header {{ background: #06b6d4; color: white; padding: 20px; text-align: center; }}
            .content {{ padding: 30px; background: #f9fafb; }}
            .button {{ 
                display: inline-block; 
                padding: 12px 30px; 
                background: #06b6d4; 
                color: white; 
                text-decoration: none; 
                border-radius: 6px;
                margin: 20px 0;
            }}
            .footer {{ padding: 20px; text-align: center; font-size: 12px; color: #666; }}
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <h1>PhishPulse Password Reset</h1>
            </div>
            <div class="content">
                <p>Hi there,</p>
                <p>You requested to reset your password for your PhishPulse account.</p>
                <p>Click the button below to reset your password:</p>
                <p style="text-align: center;">
                    <a href="{reset_url}" class="button">Reset Password</a>
                </p>
                <p>Or copy and paste this link into your browser:</p>
                <p style="word-break: break-all; color: #06b6d4;">{reset_url}</p>
                <p><strong>This link will expire in 30 minutes.</strong></p>
                <p>If you didn't request this reset, please ignore this email.</p>
            </div>
            <div class="footer">
                <p>&copy; 2026 PhishPulse. All rights reserved.</p>
                <p>This is an automated message, please do not reply.</p>
            </div>
        </div>
    </body>
    </html>
    """
    
    text_body = f"""
PhishPulse - Password Reset Request

Hi there,

You requested to reset your password for your PhishPulse account.

Click the link below to reset your password:
{reset_url}

This link will expire in 30 minutes.

If you didn't request this reset, please ignore this email.

---
© 2026 PhishPulse. All rights reserved.
This is an automated message, please do not reply.
    """
    
    return send_email(email, subject, html_body, text_body)


def send_verification_email(email: str, verification_code: str) -> bool:
    """
    Send email verification code.
    
    Args:
        email: User's email address
        verification_code: 6-digit verification code
    
    Returns:
        True if sent/logged successfully
    """
    subject = "PhishPulse - Email Verification Code"
    
    html_body = f"""
    <!DOCTYPE html>
    <html>
    <head>
        <style>
            body {{ font-family: Arial, sans-serif; line-height: 1.6; color: #333; }}
            .container {{ max-width: 600px; margin: 0 auto; padding: 20px; }}
            .header {{ background: #06b6d4; color: white; padding: 20px; text-align: center; }}
            .content {{ padding: 30px; background: #f9fafb; text-align: center; }}
            .code {{ 
                font-size: 32px; 
                font-weight: bold; 
                letter-spacing: 8px; 
                color: #06b6d4; 
                padding: 20px;
                background: white;
                border: 2px dashed #06b6d4;
                border-radius: 8px;
                margin: 20px 0;
            }}
            .footer {{ padding: 20px; text-align: center; font-size: 12px; color: #666; }}
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <h1>PhishPulse Verification</h1>
            </div>
            <div class="content">
                <p>Welcome to PhishPulse!</p>
                <p>Your verification code is:</p>
                <div class="code">{verification_code}</div>
                <p>Enter this code to verify your account.</p>
                <p><strong>This code will expire in 10 minutes.</strong></p>
            </div>
            <div class="footer">
                <p>&copy; 2026 PhishPulse. All rights reserved.</p>
            </div>
        </div>
    </body>
    </html>
    """
    
    text_body = f"""
PhishPulse - Email Verification Code

Welcome to PhishPulse!

Your verification code is: {verification_code}

Enter this code to verify your account.

This code will expire in 10 minutes.

---
© 2026 PhishPulse. All rights reserved.
    """
    
    return send_email(email, subject, html_body, text_body)
