"""
CRM 集成层 — 多 CRM 抽象

支持：Google Sheets / Airtable / HubSpot / CSV
"""

import csv
import logging
import os
from abc import ABC, abstractmethod
from pathlib import Path

from .models import LeadData, LeadStatus

logger = logging.getLogger(__name__)


class CRMBase(ABC):
    """CRM 抽象基类"""

    @abstractmethod
    def fetch_leads(self, status: str = "new") -> list[LeadData]:
        ...

    @abstractmethod
    def update_lead(self, lead: LeadData) -> bool:
        ...


class CSVLoader(CRMBase):
    """CSV 文件作为简易 CRM"""

    def __init__(self, filepath: str):
        self.filepath = Path(filepath)

    def fetch_leads(self, status: str = "new") -> list[LeadData]:
        if not self.filepath.exists():
            return []
        leads = []
        with open(self.filepath, "r", encoding="utf-8") as f:
            reader = csv.DictReader(f)
            for row in reader:
                lead = LeadData(
                    id=row.get("id", ""),
                    name=row.get("name", row.get("business_name", "")),
                    email=row.get("email", ""),
                    phone=row.get("phone", ""),
                    company=row.get("company", row.get("business_name", "")),
                    title=row.get("title", ""),
                    website=row.get("website", ""),
                    linkedin_url=row.get("linkedin_url", row.get("linkedin", "")),
                    source="csv",
                )
                leads.append(lead)
        logger.info(f"Loaded {len(leads)} leads from {self.filepath}")
        return leads

    def update_lead(self, lead: LeadData) -> bool:
        return True  # CSV 是只读的简易方案


class GoogleSheetsLoader(CRMBase):
    """Google Sheets CRM"""

    def __init__(self, spreadsheet_id: str = None):
        self.spreadsheet_id = spreadsheet_id or os.getenv("GOOGLE_SHEETS_SPREADSHEET_ID")

    def fetch_leads(self, status: str = "new") -> list[LeadData]:
        try:
            import gspread
            from google.oauth2.service_account import Credentials

            creds_file = os.getenv("GOOGLE_SHEETS_CREDENTIALS_FILE", "credentials.json")
            creds = Credentials.from_service_account_file(creds_file, scopes=[
                "https://www.googleapis.com/auth/spreadsheets",
            ])
            gc = gspread.authorize(creds)
            sheet = gc.open_by_key(self.spreadsheet_id).sheet1
            records = sheet.get_all_records()

            leads = []
            for row in records:
                if status and row.get("status", "new").lower() != status.lower():
                    continue
                leads.append(LeadData(
                    id=str(row.get("id", "")),
                    name=row.get("name", ""),
                    email=row.get("email", ""),
                    company=row.get("company", ""),
                    title=row.get("title", ""),
                    website=row.get("website", ""),
                    linkedin_url=row.get("linkedin_url", ""),
                    source="google_sheets",
                ))
            return leads
        except Exception as e:
            logger.error(f"Google Sheets error: {e}")
            return []

    def update_lead(self, lead: LeadData) -> bool:
        try:
            import gspread
            from google.oauth2.service_account import Credentials

            creds_file = os.getenv("GOOGLE_SHEETS_CREDENTIALS_FILE", "credentials.json")
            creds = Credentials.from_service_account_file(creds_file, scopes=[
                "https://www.googleapis.com/auth/spreadsheets",
            ])
            gc = gspread.authorize(creds)
            sheet = gc.open_by_key(self.spreadsheet_id).sheet1
            cell = sheet.find(lead.id)
            if cell:
                row = cell.row
                sheet.update_cell(row, sheet.find("status").col, lead.status)
                sheet.update_cell(row, sheet.find("score").col, str(lead.score))
            return True
        except Exception as e:
            logger.error(f"Update error: {e}")
            return False


def get_crm(source: str, **kwargs) -> CRMBase:
    """工厂方法 — 根据配置返回对应的 CRM 实例"""
    if source == "csv":
        return CSVLoader(kwargs.get("filepath", "leads.csv"))
    elif source == "google_sheets":
        return GoogleSheetsLoader(kwargs.get("spreadsheet_id"))
    else:
        raise ValueError(f"Unsupported CRM source: {source}")
