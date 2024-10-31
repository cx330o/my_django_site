# cx330o FlowEngine

Visual workflow automation engine for the cx330o Sales Platform.

## Features

- Visual workflow builder with drag-and-drop interface
- 400+ built-in integrations (CRM, email, databases, APIs)
- Native AI capabilities for intelligent automation
- JavaScript/Python code nodes for custom logic
- Webhook triggers for real-time event processing
- Credential management with encryption at rest

## Usage

FlowEngine is deployed as part of the cx330o platform via Docker Compose.

```bash
# Standalone
docker compose -f cx330o-infra/core/docker-compose.yml up -d

# Full platform
docker compose up -d
# Access at http://localhost:81
```

## Pre-built Workflows

- `workflows/lead-to-outreach.json` — Lead scraping → AI outreach automation
- `workflows/crm-sync.json` — Multi-system contact synchronization

## Architecture

FlowEngine runs on port 5678 internally, exposed via Nginx on port 81.
Data is stored in PostgreSQL (`flowengine` database).

## License

See root LICENSE file.
