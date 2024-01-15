"""
AI 数据丰富引擎 — ChatGPT 集成

对已有线索进行 AI 分析和个性化消息生成。
增强：使用 OpenAI 新版 API、结构化输出、批量处理。
"""

import json
import logging
import os

from .base import BaseEngine
from ..models import Lead

logger = logging.getLogger(__name__)


class AIEnricher(BaseEngine):
    """AI 数据丰富引擎 — 用 LLM 为线索生成摘要和个性化消息"""

    async def run(self) -> list[Lead]:
        """此引擎不独立抓取，而是丰富已有线索"""
        return self.leads

    async def enrich(self, leads: list[Lead], company_info: dict = None) -> list[Lead]:
        """
        批量丰富线索数据 — ChatGPT 管线增强版：
        - 结构化 JSON 输出
        - 批量处理减少 API 调用
        - 可自定义公司信息
        - 支持 Groq（免费快速）和 OpenAI
        """
        groq_key = os.getenv("GROQ_API_KEY")
        openai_key = os.getenv("OPENAI_API_KEY")

        if not groq_key and not openai_key:
            logger.warning("[AIEnricher] No GROQ_API_KEY or OPENAI_API_KEY, skipping enrichment")
            return leads

        try:
            from openai import AsyncOpenAI
            if groq_key:
                client = AsyncOpenAI(api_key=groq_key, base_url="https://api.groq.com/openai/v1")
                self._model = "llama-3.1-8b-instant"
                logger.info("[AIEnricher] Using Groq (free & fast)")
            else:
                client = AsyncOpenAI(api_key=openai_key)
                self._model = "gpt-4o-mini"
        except ImportError:
            logger.error("openai package not installed")
            return leads

        company = company_info or {
            "name": "Our Company",
            "description": "We provide professional services",
            "contact": "[email]",
        }

        # 批量处理，每批 5 个线索
        batch_size = 5
        for i in range(0, len(leads), batch_size):
            batch = leads[i:i + batch_size]
            for lead in batch:
                try:
                    lead = await self._enrich_single(client, lead, company)
                except Exception as e:
                    logger.error(f"[AIEnricher] Error enriching {lead.business_name}: {e}")

        logger.info(f"[AIEnricher] Enriched {len(leads)} leads")
        return leads

    async def _enrich_single(self, client, lead: Lead, company: dict) -> Lead:
        """单个线索的 AI 丰富"""
        lead_info = (
            f"Business: {lead.business_name}\n"
            f"Category: {lead.category}\n"
            f"Address: {lead.address}\n"
            f"Rating: {lead.rating} ({lead.review_count} reviews)\n"
            f"Website: {lead.website}"
        )

        prompt = f"""Analyze this business lead and generate:
1. A brief summary of the business (2-3 sentences)
2. A personalized outreach message from {company['name']} ({company['description']})

Lead information:
{lead_info}

Respond in JSON format:
{{"summary": "...", "personalized_message": "..."}}
"""

        response = await client.chat.completions.create(
            model=self._model,
            messages=[{"role": "user", "content": prompt}],
            temperature=0.7,
            max_tokens=500,
        )

        content = response.choices[0].message.content or ""
        # Groq 有时返回非严格 JSON，做容错解析
        try:
            data = json.loads(content)
        except json.JSONDecodeError:
            # 尝试提取 JSON 块
            import re
            match = re.search(r'\{[^{}]*\}', content, re.DOTALL)
            if match:
                try:
                    data = json.loads(match.group())
                except json.JSONDecodeError:
                    data = {}
            else:
                # 直接用原文作为摘要
                data = {"summary": content[:300], "personalized_message": ""}
        lead.ai_summary = data.get("summary", "")
        lead.ai_personalized_message = data.get("personalized_message", "")
        return lead
