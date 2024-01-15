"""
核心管线 — 编排所有引擎，实现端到端的线索获取流程

这是整个项目的核心，将多种能力串联成一个统一的管线：
1. 多源并行抓取
2. 数据去重与合并
3. AI 丰富
4. 统一输出
"""

import asyncio
import logging
from typing import Optional

from .models import Lead, ScrapeConfig
from .engines.google_maps import GoogleMapsEngine
from .engines.yelp import YelpEngine
from .engines.osint import OSINTEngine
from .engines.ai_enricher import AIEnricher
from .output import OutputManager

logger = logging.getLogger(__name__)

ENGINE_MAP = {
    "google_maps": GoogleMapsEngine,
    "yelp": YelpEngine,
    "osint": OSINTEngine,
}


class LeadGenPipeline:
    """统一线索获取管线"""

    def __init__(self, config: ScrapeConfig, output_dir: str = "./output"):
        self.config = config
        self.output = OutputManager(output_dir)
        self.all_leads: list[Lead] = []
        self.all_reviews = []

    async def run(self) -> list[Lead]:
        """执行完整管线"""
        logger.info(f"🚀 Starting LeadGen Pro pipeline")
        logger.info(f"   Query: {self.config.query}")
        logger.info(f"   Location: {self.config.location}")
        logger.info(f"   Sources: {self.config.sources}")

        # 1. 多源并行抓取
        await self._scrape_all_sources()

        # 2. 去重
        self._deduplicate()

        # 3. AI 丰富（可选）
        if self.config.ai_enrich:
            await self._ai_enrich()

        # 4. 输出
        self.output.to_csv(self.all_leads)
        self.output.to_json(self.all_leads)
        if self.all_reviews:
            self.output.reviews_to_csv(self.all_reviews)

        logger.info(f"✅ Pipeline complete: {len(self.all_leads)} unique leads")
        return self.all_leads

    async def _scrape_all_sources(self):
        """并行执行所有数据源引擎"""
        tasks = []
        for source_name in self.config.sources:
            engine_cls = ENGINE_MAP.get(source_name)
            if not engine_cls:
                logger.warning(f"Unknown source: {source_name}")
                continue
            engine = engine_cls(self.config)
            tasks.append(self._run_engine(engine))

        results = await asyncio.gather(*tasks, return_exceptions=True)
        for result in results:
            if isinstance(result, Exception):
                logger.error(f"Engine error: {result}")

    async def _run_engine(self, engine):
        """运行单个引擎并收集结果"""
        try:
            async with engine:
                leads = await engine.run()
                self.all_leads.extend(leads)
                # 收集评论（如果引擎支持）
                if hasattr(engine, "reviews"):
                    self.all_reviews.extend(engine.reviews)
                logger.info(f"  [{engine.name}] returned {len(leads)} leads")
        except Exception as e:
            logger.error(f"  [{engine.name}] failed: {e}")

    def _deduplicate(self):
        """基于 dedup_key 去重"""
        seen = set()
        unique = []
        for lead in self.all_leads:
            key = lead.dedup_key
            if key not in seen:
                seen.add(key)
                unique.append(lead)
        removed = len(self.all_leads) - len(unique)
        if removed:
            logger.info(f"  🔄 Removed {removed} duplicates")
        self.all_leads = unique

    async def _ai_enrich(self):
        """AI 丰富所有线索"""
        enricher = AIEnricher(self.config)
        self.all_leads = await enricher.enrich(self.all_leads)
