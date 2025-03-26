# cx330o Mailer

High-performance email delivery engine for the cx330o Sales Platform.

## Features

- Newsletter and mailing list management
- Subscriber management with custom attributes
- Campaign creation and scheduling
- Template management with rich editor
- Bounce and complaint handling
- Analytics and tracking (opens, clicks)
- REST API for programmatic access
- Multi-SMTP support

## Usage

```bash
# Part of the full platform
docker compose up -d
# Access at http://localhost:9000 (standalone) or via Marketing Gateway
```

## Architecture

High-performance Go-based email delivery engine. Uses PostgreSQL for data storage.
Integrates with the cx330o Marketing Gateway for unified API access.

## License

See root LICENSE file.
