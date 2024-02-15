"""CLI 入口 — python -m outreach_ai"""

import argparse
import asyncio
import logging
import sys

from dotenv import load_dotenv

from .pipeline import OutreachPipeline

load_dotenv()


def main():
    parser = argparse.ArgumentParser(description="Outreach AI — AI 销售外联引擎")
    parser.add_argument("--leads", "-l", default="leads.csv", help="线索文件路径")
    parser.add_argument("--crm", default="csv", choices=["csv", "google_sheets"], help="CRM 数据源")
    parser.add_argument("--auto-send", action="store_true", help="自动发送邮件")
    parser.add_argument("--min-score", type=float, default=50.0, help="最低合格分数")
    parser.add_argument("--company-name", default="Our Company", help="你的公司名称")
    parser.add_argument("--company-desc", default="We provide professional services", help="公司描述")
    parser.add_argument("--verbose", "-v", action="store_true")

    args = parser.parse_args()

    logging.basicConfig(
        level=logging.DEBUG if args.verbose else logging.INFO,
        format="%(asctime)s [%(levelname)s] %(message)s",
        datefmt="%H:%M:%S",
    )

    company_info = {
        "name": args.company_name,
        "description": args.company_desc,
    }

    pipeline = OutreachPipeline(
        crm_source=args.crm,
        crm_kwargs={"filepath": args.leads},
        company_info=company_info,
        auto_send=args.auto_send,
        min_score=args.min_score,
    )

    if sys.platform == "win32":
        asyncio.set_event_loop_policy(asyncio.WindowsSelectorEventLoopPolicy())

    asyncio.run(pipeline.run())


if __name__ == "__main__":
    main()
