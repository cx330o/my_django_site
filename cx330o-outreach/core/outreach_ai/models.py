"""
统一数据模型 — 融合状态管理 + 邮件活动模型
"""

from pydantic import BaseModel, Field
from typing import Optional
from datetime import datetime
from enum import Enum


class LeadStatus(str, Enum):
    NEW = "new"
    RESEARCHING = "researching"
    QUALIFIED = "qualified"
    UNQUALIFIED = "unqualified"
    CONTACTED = "contacted"
    REPLIED = "replied"
    CONVERTED = "converted"


class SocialMediaLinks(BaseModel):
    """社交媒体链接模型"""
    blog: str = ""
    facebook: str = ""
    twitter: str = ""
    youtube: str = ""
    linkedin: str = ""


class LeadData(BaseModel):
    """核心线索模型 — 融合线索数据 + 邮件活动字段"""
    id: str = ""
    name: str = ""
    email: str = ""
    phone: str = ""
    company: str = ""
    title: str = ""
    address: str = ""
    website: str = ""
    linkedin_url: str = ""
    status: LeadStatus = LeadStatus.NEW
    # 研究数据
    profile_summary: str = ""
    company_profile: str = ""
    social_media: SocialMediaLinks = Field(default_factory=SocialMediaLinks)
    # 评分
    score: float = 0.0
    score_reason: str = ""
    # 外联数据
    personalized_email: str = ""
    email_subject: str = ""
    outreach_report: str = ""
    interview_script: str = ""
    # 元数据
    source: str = ""
    created_at: datetime = Field(default_factory=datetime.utcnow)


class Report(BaseModel):
    """研究报告"""
    title: str = ""
    content: str = ""
    is_markdown: bool = False


class EmailTemplate(BaseModel):
    """邮件模板 — 模板管理系统"""
    name: str = ""
    subject: str = ""
    body: str = ""
    variables: list[str] = Field(default_factory=list)


class Campaign(BaseModel):
    """邮件活动 — 活动管理模型"""
    name: str = ""
    leads: list[LeadData] = Field(default_factory=list)
    template: Optional[EmailTemplate] = None
    followup_templates: list[EmailTemplate] = Field(default_factory=list)
    followup_delay_days: int = 3
    status: str = "draft"  # draft / active / paused / completed


class ConversationStage(BaseModel):
    """对话阶段 — 8 阶段对话模型"""
    id: int
    name: str
    description: str


# 对话阶段定义
CONVERSATION_STAGES = {
    1: ConversationStage(id=1, name="Introduction",
        description="Introduce yourself and your company. Be polite and professional."),
    2: ConversationStage(id=2, name="Qualification",
        description="Confirm they are the right person with purchasing authority."),
    3: ConversationStage(id=3, name="Value Proposition",
        description="Explain how your product/service benefits the prospect."),
    4: ConversationStage(id=4, name="Needs Analysis",
        description="Ask open-ended questions to uncover needs and pain points."),
    5: ConversationStage(id=5, name="Solution Presentation",
        description="Present your product/service as the solution to their pain points."),
    6: ConversationStage(id=6, name="Objection Handling",
        description="Address objections with evidence or testimonials."),
    7: ConversationStage(id=7, name="Close",
        description="Propose next step: demo, trial, or meeting."),
    8: ConversationStage(id=8, name="End",
        description="End the conversation gracefully."),
}
