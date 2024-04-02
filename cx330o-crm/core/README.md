# cx330o CRM — Customer Management Platform

A full-featured CRM system with PDF generation and email parsing extensions.

## Architecture

```
cx330o-crm/core/
├── twenty-extensions/          # CRM extensions
│   ├── pdf-generator/          # PDF invoice/quote generation
│   └── email-parser/           # Inbound email parsing via webhook
├── docker-compose.yml          # Unified deployment
└── README.md
```

## Features

1. **Core CRM Platform** — Full customer lifecycle management (contacts, deals, pipelines)
2. **PDF Generator** — Invoice and quote PDF generation microservice
3. **Email Parser** — Inbound email webhook parsing for automatic lead capture

## Deployment

```bash
docker compose up -d
```
