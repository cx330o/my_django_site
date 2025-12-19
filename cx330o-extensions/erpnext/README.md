# cx330o ERP Extension

Powerful, intuitive ERP module for the cx330o Sales Platform.

## Key Features

- **Accounting**: Manage cash flow, record transactions, and generate financial reports.
- **Order Management**: Track inventory levels, replenish stock, and manage sales orders, customers, suppliers, shipments, and fulfillment.
- **Manufacturing**: Simplify the production cycle, track material consumption, handle capacity planning and subcontracting.
- **Asset Management**: Manage IT infrastructure and equipment across your organization.
- **Projects**: Deliver internal and external projects on time and budget. Track tasks, timesheets, and issues.

## Tech Stack

- **Backend**: Python (custom framework), MariaDB/PostgreSQL
- **Frontend**: Vue.js-based UI library
- **API**: REST + GraphQL

## Setup

### Docker

```bash
docker compose up -d
```

### Local Development

1. Install dependencies following the installation guide
2. Start the server:
   ```bash
   bench start
   ```
3. Create a new site:
   ```bash
   bench new-site erp.localhost
   ```
4. Install the app:
   ```bash
   bench --site erp.localhost install-app erpnext
   ```
5. Open `http://erp.localhost:8000/app` in your browser

## License

GPL-3.0 — See license.txt file.
