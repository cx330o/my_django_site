# cx330o Outreach Workflow

LangGraph-based sales outreach automation workflow for the cx330o Sales Platform.

## Features

- Multi-CRM integration (HubSpot, Airtable, Google Sheets)
- Automated LinkedIn profile scraping
- Company digital presence analysis (website, blog, social media)
- Recent company news analysis
- Pain point identification and recommendation
- Lead qualification with configurable criteria
- Personalized outreach report generation (saved to Google Docs)
- AI-generated cold emails with case study references (RAG)
- SPIN-based interview script preparation
- Automated CRM status updates

## System Workflow

1. Fetch leads from CRM
2. Research & analyze each lead (LinkedIn, website, news)
3. Generate detailed analysis reports
4. Qualify leads based on configurable criteria
5. Generate personalized outreach materials for qualified leads
6. Update CRM with status and report links

## Quick Start

```bash
pip install -r requirements.txt
cp .env.example .env  # Add API keys
python main.py
```

## Tech Stack

- LangChain + LangGraph for AI orchestration
- Google Gemini LLM (configurable)
- Serper API for web search
- RapidAPI for LinkedIn data

## License

MIT — See root LICENSE file.
