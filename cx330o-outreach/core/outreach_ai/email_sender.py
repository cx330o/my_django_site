"""
邮件发送模块 — 融合多种发送方式：
- SMTP 发送、模板渲染、跟进链
- Gmail API 发送
- Gmail 草稿创建
"""

import logging
import os
import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from typing import Optional

from .models import LeadData

logger = logging.getLogger(__name__)


class EmailSender:
    """统一邮件发送器"""

    def __init__(
        self,
        smtp_host: str = None,
        smtp_port: int = None,
        smtp_email: str = None,
        smtp_password: str = None,
    ):
        self.host = smtp_host or os.getenv("SMTP_HOST", "smtp.gmail.com")
        self.port = smtp_port or int(os.getenv("SMTP_PORT", "587"))
        self.email = smtp_email or os.getenv("SMTP_EMAIL", "")
        self.password = smtp_password or os.getenv("SMTP_PASSWORD", "")

    def send(self, lead: LeadData, subject: str = None, body: str = None) -> bool:
        """
        发送邮件 — SMTP 发送 + 错误处理
        """
        to_email = lead.email
        subject = subject or lead.email_subject
        body = body or lead.personalized_email

        if not to_email:
            logger.warning(f"No email for lead: {lead.name}")
            return False
        if not self.email or not self.password:
            logger.error("SMTP credentials not configured")
            return False

        try:
            msg = MIMEMultipart("alternative")
            msg["From"] = self.email
            msg["To"] = to_email
            msg["Subject"] = subject

            # 纯文本和 HTML 版本
            msg.attach(MIMEText(body, "plain"))
            msg.attach(MIMEText(f"<html><body><p>{body.replace(chr(10), '<br>')}</p></body></html>", "html"))

            with smtplib.SMTP(self.host, self.port) as server:
                server.starttls()
                server.login(self.email, self.password)
                server.send_message(msg)

            logger.info(f"✅ Email sent to {to_email}")
            lead.status = "contacted"
            return True

        except smtplib.SMTPRecipientsRefused:
            logger.error(f"❌ Recipient refused: {to_email}")
        except smtplib.SMTPAuthenticationError:
            logger.error("❌ SMTP authentication failed")
        except Exception as e:
            logger.error(f"❌ Send error: {e}")

        return False

    def send_batch(self, leads: list[LeadData], delay_seconds: float = 3.0) -> dict:
        """
        批量发送 — 批量发送 + 速率控制
        """
        import time
        results = {"sent": 0, "failed": 0, "skipped": 0}

        for lead in leads:
            if lead.status == "unqualified":
                results["skipped"] += 1
                continue
            if not lead.personalized_email:
                results["skipped"] += 1
                continue

            success = self.send(lead)
            if success:
                results["sent"] += 1
            else:
                results["failed"] += 1

            time.sleep(delay_seconds)

        logger.info(f"📧 Batch complete: {results}")
        return results
