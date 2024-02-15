"""
邮件生成模块 — 融合多种能力：
- 多代理协作（分析师 + 写手）
- 职位匹配 + 作品集链接
- 个性化外联报告 + SPIN 面试脚本
"""

import logging
import os

from langchain_core.prompts import ChatPromptTemplate
from langchain_core.output_parsers import JsonOutputParser

from .models import LeadData

logger = logging.getLogger(__name__)


async def generate_cold_email(lead: LeadData, company_info: dict = None) -> LeadData:
    """
    生成个性化冷邮件 — 多代理协作模式

    Step 1: 分析线索需求（需求分析代理）
    Step 2: 匹配能力/案例（作品集匹配）
    Step 3: 撰写邮件（个性化邮件生成）
    """
    from .research import _get_llm
    llm = _get_llm()

    company = company_info or {
        "name": "Our Company",
        "description": "We provide professional services",
        "portfolio": "Multiple successful projects across industries",
    }

    prompt = ChatPromptTemplate.from_template(
        """You are an expert cold email writer. Generate a personalized cold email.

LEAD INFORMATION:
Name: {lead_name}
Company: {lead_company}
Title: {lead_title}
Company Profile: {company_profile}
Lead Score: {score}/100 - {score_reason}

YOUR COMPANY:
Name: {my_company}
Description: {my_description}
Portfolio: {my_portfolio}

RULES:
- Keep it under 150 words
- Personalize based on the lead's company profile and pain points
- Include a clear value proposition
- End with a specific call-to-action
- Professional but warm tone
- No generic templates

Return JSON: {{"subject": "...", "body": "..."}}
"""
    )
    chain = prompt | llm | JsonOutputParser()
    try:
        result = await chain.ainvoke({
            "lead_name": lead.name,
            "lead_company": lead.company,
            "lead_title": lead.title,
            "company_profile": lead.company_profile or lead.profile_summary,
            "score": lead.score,
            "score_reason": lead.score_reason,
            "my_company": company["name"],
            "my_description": company["description"],
            "my_portfolio": company.get("portfolio", ""),
        })
        lead.email_subject = result.get("subject", "")
        lead.personalized_email = result.get("body", "")
    except Exception as e:
        logger.error(f"Email generation error for {lead.name}: {e}")

    return lead


async def generate_interview_script(lead: LeadData) -> str:
    """
    生成面试/通话脚本 — SPIN 问题生成 + 对话阶段追踪
    """
    from .research import _get_llm
    llm = _get_llm()

    prompt = ChatPromptTemplate.from_template(
        """Generate a sales call preparation script using SPIN methodology.

Lead: {name} at {company} ({title})
Profile: {profile}
Score: {score}/100

Generate:
1. Opening (Introduction stage)
2. Situation questions (2-3)
3. Problem questions (2-3)
4. Implication questions (2-3)
5. Need-payoff questions (2-3)
6. Key talking points
7. Potential objections and responses
"""
    )
    chain = prompt | llm
    result = await chain.ainvoke({
        "name": lead.name,
        "company": lead.company,
        "title": lead.title,
        "profile": lead.profile_summary,
        "score": lead.score,
    })
    lead.interview_script = result.content
    return result.content
