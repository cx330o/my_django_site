"""
线索研究模块 — 多阶段研究流程

功能：LinkedIn 分析、公司网站分析、社交媒体分析、新闻分析
"""

import logging
import os

from langchain_core.prompts import ChatPromptTemplate
from langchain_openai import ChatOpenAI

from .models import LeadData, Report

logger = logging.getLogger(__name__)


def _get_llm():
    """获取 LLM 实例 — 支持 OpenAI 和 Groq"""
    if os.getenv("GROQ_API_KEY"):
        from langchain_groq import ChatGroq
        return ChatGroq(model_name="llama-3.1-70b-versatile", temperature=0)
    return ChatOpenAI(model="gpt-4o-mini", temperature=0)


async def research_lead(lead: LeadData) -> tuple[LeadData, list[Report]]:
    """
    对单个线索进行全面研究 — 多节点研究流程
    """
    llm = _get_llm()
    reports = []

    # 1. 生成公司概况（公司信息收集节点）
    if lead.website or lead.company:
        company_report = await _analyze_company(llm, lead)
        if company_report:
            lead.company_profile = company_report.content
            reports.append(company_report)

    # 2. 生成线索综合研究报告（综合研究报告生成节点）
    full_report = await _generate_research_report(llm, lead)
    if full_report:
        lead.profile_summary = full_report.content
        reports.append(full_report)

    return lead, reports


async def _analyze_company(llm, lead: LeadData) -> Report:
    prompt = ChatPromptTemplate.from_template(
        """Analyze this company and provide a brief profile:
Company: {company}
Website: {website}
Lead's Title: {title}

Provide:
1. What the company does (2-3 sentences)
2. Industry and market position
3. Potential pain points for outreach
"""
    )
    chain = prompt | llm
    result = await chain.ainvoke({
        "company": lead.company,
        "website": lead.website,
        "title": lead.title,
    })
    return Report(title=f"Company Profile: {lead.company}", content=result.content)


async def _generate_research_report(llm, lead: LeadData) -> Report:
    prompt = ChatPromptTemplate.from_template(
        """Generate a comprehensive research report for this sales lead:

Name: {name}
Company: {company}
Title: {title}
Company Profile: {company_profile}

Provide:
1. Lead summary
2. Key opportunities for engagement
3. Recommended approach
4. Potential objections and how to handle them
"""
    )
    chain = prompt | llm
    result = await chain.ainvoke({
        "name": lead.name,
        "company": lead.company,
        "title": lead.title,
        "company_profile": lead.company_profile,
    })
    return Report(title=f"Research Report: {lead.name}", content=result.content, is_markdown=True)
