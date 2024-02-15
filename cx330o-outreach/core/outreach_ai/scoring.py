"""
线索评分模块 — 线索评分节点

根据研究数据对线索进行评分和资格判定。
"""

import logging
import os

from langchain_core.prompts import ChatPromptTemplate
from langchain_core.output_parsers import JsonOutputParser

from .models import LeadData

logger = logging.getLogger(__name__)


async def score_lead(lead: LeadData) -> LeadData:
    """
    评分线索 — 多维度评分标准：
    - 数字化存在（网站、博客）
    - 社交媒体活跃度
    - 行业匹配度
    - 公司规模和潜力
    """
    from .research import _get_llm
    llm = _get_llm()

    prompt = ChatPromptTemplate.from_template(
        """Score this sales lead on a scale of 0-100 based on:
1. Digital presence quality (website, social media)
2. Industry fit and potential need for our services
3. Company scale and growth indicators
4. Engagement potential

Lead info:
Name: {name}
Company: {company}
Title: {title}
Website: {website}
Profile: {profile}

Return JSON: {{"score": <number>, "qualified": <true/false>, "reason": "<brief explanation>"}}
"""
    )
    chain = prompt | llm | JsonOutputParser()
    try:
        result = await chain.ainvoke({
            "name": lead.name,
            "company": lead.company,
            "title": lead.title,
            "website": lead.website,
            "profile": lead.profile_summary,
        })
        lead.score = float(result.get("score", 0))
        lead.score_reason = result.get("reason", "")
        if result.get("qualified"):
            lead.status = "qualified"
        else:
            lead.status = "unqualified"
    except Exception as e:
        logger.error(f"Scoring error for {lead.name}: {e}")
        lead.score = 50.0
        lead.status = "qualified"  # 默认通过

    return lead
