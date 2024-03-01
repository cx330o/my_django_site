# cx330o Infra — Infrastructure & Analytics

Unified deployment for workflow orchestration and data analytics, with pre-built sales automation templates.

## Core Components

1. **FlowEngine** — Visual workflow automation with 400+ integrations
2. **Analytics** — No-code BI dashboards with AI-powered queries

## Pre-built Workflows

- `workflows/lead-to-outreach.json` — Lead scraping → AI outreach automation
- `workflows/crm-sync.json` — Multi-system contact synchronization

## Pre-built Dashboards

Analytics connects to PostgreSQL to track:
- Lead acquisition trends
- Email send/open/reply rates
- Sales funnel conversion
- Customer source analysis

## Deployment

```bash
docker compose up -d
# FlowEngine: http://localhost:5678
# Analytics: http://localhost:3030
```
