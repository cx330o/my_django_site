# cx330o Analytics

Business intelligence and data visualization module for the cx330o Sales Platform.

## Features

- No-code query builder for non-technical users
- SQL editor for advanced queries
- Interactive dashboards with filters and auto-refresh
- Scheduled reports via email and Slack
- Embeddable charts and dashboards
- AI-powered query assistance

## Usage

Analytics is deployed as part of the cx330o platform via Docker Compose.

```bash
# Full platform
docker compose up -d
# Access at http://localhost:82
```

## Pre-built Dashboards

Connects to PostgreSQL to track:
- Lead acquisition trends
- Email send/open/reply rates
- Sales funnel conversion
- Customer source analysis

## Architecture

Analytics runs on port 3000 internally, exposed via Nginx on port 82.
Metadata is stored in PostgreSQL (`analytics` database).

## License

See root LICENSE file.
