# cx330o Marketing — Unified Marketing Automation

An omnichannel marketing platform with journey building, high-performance email delivery, and live chat.

## Architecture

The marketing module coordinates multiple specialized services through a unified API gateway:

1. **Journey Builder** — Customer journey automation with omnichannel messaging
2. **Mailer** — High-performance Go-based email delivery engine
3. **Live Chat** — Real-time omnichannel customer support
4. **API Gateway** — Unified routing to all marketing services

Lead scoring algorithms are integrated as configurable rules within the journey builder.

## Deployment

```bash
docker compose up -d
```

## Service Ports

| Service | Port | Purpose |
|---------|------|---------|
| Journey Builder | 3010 | Marketing automation console |
| Mailer | 9000 | Email list management |
| Live Chat | 3011 | Customer support |
| API Gateway | 8080 | Unified API entry point |
