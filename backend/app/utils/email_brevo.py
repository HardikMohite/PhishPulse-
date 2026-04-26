"""
Email utility for sending emails via Brevo (formerly Sendinblue) API.
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
    if not getattr(settings, 'BREVO_API_KEY', None):
        logger.warning("Brevo API key not configured. Logging email to console.")
        logger.info(text_body or "[html only]")
        return True

    from_email = getattr(settings, 'FROM_EMAIL', None) or "noreply@phishpulse.com"

    headers = {
        "accept": "application/json",
        "api-key": settings.BREVO_API_KEY,
        "content-type": "application/json",
    }
    payload = {
        "sender": {"name": "PhishPulse", "email": from_email},
        "to": [{"email": to_email, "name": to_name}],
        "subject": subject,
        "htmlContent": html_body,
    }
    if text_body:
        payload["textContent"] = text_body

    try:
        response = requests.post(
            "https://api.brevo.com/v3/smtp/email",
            json=payload, headers=headers, timeout=15
        )

        if response.status_code == 201:
            logger.info(f"Email sent to {to_email} via Brevo")
            return True

        error_detail = response.text
        print(
            f"\n{'='*60}\n"
            f"BREVO SEND FAILED\n"
            f"  HTTP   : {response.status_code}\n"
            f"  From   : {from_email}\n"
            f"  To     : {to_email}\n"
            f"  Error  : {error_detail}\n"
            f"  Fix    : Verify sender at https://app.brevo.com/senders\n"
            f"{'='*60}\n"
        )
        logger.error(f"Brevo error {response.status_code}: {error_detail}")
        raise RuntimeError(f"Brevo returned HTTP {response.status_code}: {error_detail}")

    except requests.exceptions.Timeout:
        raise RuntimeError("Email service timed out. Please try again.")
    except requests.exceptions.ConnectionError:
        raise RuntimeError("Cannot reach email service. Check network/firewall.")
    except RuntimeError:
        raise
    except Exception as e:
        raise RuntimeError(f"Unexpected email error: {e}")


# ── Design tokens (matches frontend exactly) ────────────────────────────────
_BG_OUTER   = "#0b0e13"
_BG_CARD    = "#0d1117"
_BG_SECTION = "#0f1420"
_BORDER     = "#1a2235"
_CYAN       = "#06b6d4"
_CYAN_DIM   = "#0e7490"
_CYAN_BG    = "#071825"
_RED        = "#ef4444"
_RED_BG     = "#1a0808"
_WHITE      = "#f1f5f9"
_MUTED      = "#8b9ab0"
_DIM        = "#3d4f66"

# Custom shield SVG inlined — exact same paths as frontend CustomShield.tsx
# Rendered as a 36x36 inline SVG so email clients show it correctly
_SHIELD_SVG = (
    '<svg width="28" height="28" viewBox="0 0 24 24" fill="none" '
    'xmlns="http://www.w3.org/2000/svg" style="display:block;">'
    # outline
    f'<path d="M12 2L3 6v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V6l-9-4z" '
    f'stroke="{_CYAN}" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" fill="none"/>'
    # half fill
    f'<path d="M12 2L3 6v6c0 5.55 3.84 10.74 9 12V2z" fill="{_CYAN}" opacity="0.35"/>'
    '</svg>'
)


def _wrap(body_rows: str) -> str:
    """Outer chrome shared by all email templates."""
    return f"""<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width,initial-scale=1.0">
</head>
<body style="margin:0;padding:0;background-color:{_BG_OUTER};
             font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Helvetica,Arial,sans-serif;">

<table role="presentation" width="100%" cellpadding="0" cellspacing="0"
       style="background-color:{_BG_OUTER};">
<tr><td align="center" style="padding:48px 16px;">

  <!-- Card -->
  <table role="presentation" width="580" cellpadding="0" cellspacing="0"
         style="max-width:580px;width:100%;background-color:{_BG_CARD};
                border-radius:16px;border:1px solid {_BORDER};overflow:hidden;">

    <!-- ── Header ───────────────────────────────────────────── -->
    <tr>
      <td style="padding:28px 40px 24px 40px;border-bottom:1px solid {_BORDER};
                 background-color:{_BG_CARD};">
        <table role="presentation" cellpadding="0" cellspacing="0">
          <tr>
            <!-- Shield icon box -->
            <td style="padding-right:14px;vertical-align:middle;">
              <table role="presentation" cellpadding="0" cellspacing="0"
                     style="width:44px;height:44px;background-color:{_CYAN_BG};
                            border-radius:10px;border:1px solid {_CYAN_DIM};">
                <tr>
                  <td align="center" valign="middle" style="padding:8px;">
                    {_SHIELD_SVG}
                  </td>
                </tr>
              </table>
            </td>
            <!-- Wordmark + tagline -->
            <td style="vertical-align:middle;">
              <div style="font-size:20px;font-weight:700;letter-spacing:-0.4px;line-height:1.2;">
                <span style="color:{_WHITE};">Phish</span><span style="color:{_CYAN};">Pulse</span>
              </div>
              <div style="font-size:11px;color:{_MUTED};margin-top:2px;letter-spacing:0.3px;">
                Cybersecurity Training Platform
              </div>
            </td>
          </tr>
        </table>
      </td>
    </tr>

    {body_rows}

    <!-- ── Footer ───────────────────────────────────────────── -->
    <tr>
      <td style="padding:22px 40px;border-top:1px solid {_BORDER};
                 background-color:{_BG_OUTER};">
        <p style="margin:0 0 4px;font-size:12px;color:{_DIM};text-align:center;">
          &copy; 2025 PhishPulse &mdash; Cybersecurity Training Platform
        </p>
        <p style="margin:0;font-size:11px;color:{_DIM};text-align:center;">
          This is an automated message. Please do not reply.
        </p>
      </td>
    </tr>

  </table>
  <!-- /Card -->

</td></tr>
</table>
</body>
</html>"""


def _otp_digits(code: str) -> str:
    """Render each digit in its own cyan box."""
    cells = ""
    for d in code:
        cells += (
            f'<td style="padding:0 5px;">'
            f'<table role="presentation" cellpadding="0" cellspacing="0">'
            f'<tr><td align="center" valign="middle"'
            f' style="width:46px;height:56px;background-color:{_CYAN_BG};'
            f'border:1px solid {_CYAN_DIM};border-radius:10px;'
            f'font-size:30px;font-weight:700;color:{_CYAN};'
            f'font-family:Courier New,Courier,monospace;letter-spacing:0;">'
            f'{d}'
            f'</td></tr></table></td>'
        )
    return cells


def _expiry_pill(minutes: int) -> str:
    return (
        f'<table role="presentation" cellpadding="0" cellspacing="0" style="margin:0 auto 30px auto;">'
        f'<tr><td style="padding:7px 22px;background-color:{_BG_SECTION};'
        f'border:1px solid {_BORDER};border-radius:999px;">'
        f'<span style="font-size:13px;color:{_MUTED};">'
        f'Expires in&nbsp;<strong style="color:{_CYAN};">{minutes} minutes</strong>'
        f'</span></td></tr></table>'
    )


def _security_notice(msg: str) -> str:
    return (
        f'<tr><td style="padding:0 40px 40px 40px;">'
        f'<table role="presentation" width="100%" cellpadding="0" cellspacing="0"'
        f' style="background-color:{_RED_BG};border-radius:10px;border-left:3px solid {_RED};">'
        f'<tr><td style="padding:14px 18px;">'
        f'<p style="margin:0;font-size:13px;color:#fca5a5;line-height:1.6;">'
        f'<strong style="color:{_RED};">Security notice:&nbsp;</strong>{msg}'
        f'</p></td></tr></table></td></tr>'
    )


# ── send_otp_email — registration verification ──────────────────────────────

def send_otp_email(to_email: str, otp_code: str, to_name: str = None) -> bool:
    """OTP email for account registration. Expires in 10 minutes."""
    if not to_name:
        to_name = to_email.split('@')[0]

    subject = "PhishPulse \u2014 Your Verification Code"

    body = f"""
    <tr>
      <td style="padding:40px 40px 28px 40px;">
        <h1 style="margin:0 0 10px;font-size:22px;font-weight:700;
                   color:{_WHITE};letter-spacing:-0.3px;">
          Verify your account
        </h1>
        <p style="margin:0 0 28px;font-size:15px;color:{_MUTED};line-height:1.7;">
          Hi <strong style="color:{_WHITE};">{to_name}</strong>,
          enter the code below to complete your registration:
        </p>
        <!-- OTP digits -->
        <table role="presentation" cellpadding="0" cellspacing="0"
               style="margin:0 auto 24px auto;">
          <tr>{_otp_digits(otp_code)}</tr>
        </table>
        {_expiry_pill(10)}
        <p style="margin:0;font-size:14px;color:{_MUTED};line-height:1.6;">
          If you did not create a PhishPulse account, you can safely ignore this email.
        </p>
      </td>
    </tr>
    {_security_notice("Never share this code with anyone. PhishPulse will never ask for your verification code.")}
    """

    text = (
        f"PhishPulse \u2014 Verify your account\n\n"
        f"Hi {to_name},\n\nYour verification code: {otp_code}\n\n"
        f"Expires in 10 minutes.\n\n"
        f"If you did not sign up, ignore this email.\n\n"
        f"---\nPhishPulse \u2014 Cybersecurity Training Platform"
    )
    return send_email_brevo(to_email, to_name, subject, _wrap(body), text)


# ── send_reset_otp_email — password reset OTP ───────────────────────────────

def send_reset_otp_email(to_email: str, otp_code: str, to_name: str = None) -> bool:
    """OTP email for password reset. Expires in 10 minutes."""
    if not to_name:
        to_name = to_email.split('@')[0]

    subject = "PhishPulse \u2014 Password Reset Code"

    body = f"""
    <tr>
      <td style="padding:40px 40px 28px 40px;">
        <h1 style="margin:0 0 10px;font-size:22px;font-weight:700;
                   color:{_WHITE};letter-spacing:-0.3px;">
          Reset your password
        </h1>
        <p style="margin:0 0 28px;font-size:15px;color:{_MUTED};line-height:1.7;">
          Hi <strong style="color:{_WHITE};">{to_name}</strong>,
          we received a request to reset your password. Use the code below:
        </p>
        <!-- OTP digits -->
        <table role="presentation" cellpadding="0" cellspacing="0"
               style="margin:0 auto 24px auto;">
          <tr>{_otp_digits(otp_code)}</tr>
        </table>
        {_expiry_pill(10)}
        <p style="margin:0;font-size:14px;color:{_MUTED};line-height:1.6;">
          If you did not request a password reset, ignore this email.
          Your password will not be changed.
        </p>
      </td>
    </tr>
    {_security_notice("Never share this code with anyone. PhishPulse will never call you to ask for this code.")}
    """

    text = (
        f"PhishPulse \u2014 Password Reset\n\n"
        f"Hi {to_name},\n\nYour reset code: {otp_code}\n\n"
        f"Expires in 10 minutes.\n\n"
        f"If you did not request a reset, ignore this email.\n\n"
        f"---\nPhishPulse \u2014 Cybersecurity Training Platform"
    )
    return send_email_brevo(to_email, to_name, subject, _wrap(body), text)


# ── send_password_reset_email — legacy link-based reset ─────────────────────

def send_password_reset_email(to_email: str, to_name: str, reset_link: str) -> bool:
    """Legacy link-based password reset email."""
    subject = "PhishPulse \u2014 Password Reset Request"

    body = f"""
    <tr>
      <td style="padding:40px 40px 40px 40px;">
        <h1 style="margin:0 0 10px;font-size:22px;font-weight:700;
                   color:{_WHITE};letter-spacing:-0.3px;">
          Reset your password
        </h1>
        <p style="margin:0 0 6px;font-size:15px;color:{_MUTED};line-height:1.7;">
          Hi <strong style="color:{_WHITE};">{to_name}</strong>,
        </p>
        <p style="margin:0 0 32px;font-size:15px;color:{_MUTED};line-height:1.7;">
          We received a request to reset your PhishPulse password.
          Click the button below to choose a new one.
        </p>
        <!-- CTA button -->
        <table role="presentation" cellpadding="0" cellspacing="0" style="margin:0 0 32px;">
          <tr>
            <td style="background-color:{_CYAN};border-radius:8px;">
              <a href="{reset_link}"
                 style="display:inline-block;padding:14px 36px;font-size:15px;
                        font-weight:700;color:#000000;text-decoration:none;
                        border-radius:8px;letter-spacing:-0.2px;">
                Reset password
              </a>
            </td>
          </tr>
        </table>
        <p style="margin:0 0 6px;font-size:12px;color:{_DIM};">
          Or paste this link in your browser:
        </p>
        <p style="margin:0 0 28px;font-size:12px;word-break:break-all;">
          <a href="{reset_link}" style="color:{_CYAN};text-decoration:none;">{reset_link}</a>
        </p>
        <p style="margin:0;font-size:13px;color:{_DIM};">
          This link expires in
          <strong style="color:{_MUTED};">1 hour</strong>.
          If you did not request this, ignore this email.
        </p>
      </td>
    </tr>
    """

    text = (
        f"PhishPulse \u2014 Password Reset\n\n"
        f"Hi {to_name},\n\nReset your password: {reset_link}\n\n"
        f"Expires in 1 hour.\n\n"
        f"If you did not request this, ignore this email.\n\n"
        f"---\nPhishPulse \u2014 Cybersecurity Training Platform"
    )
    return send_email_brevo(to_email, to_name, subject, _wrap(body), text)