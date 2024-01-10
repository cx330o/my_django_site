# cx330o Overseas Sales Platform — Architecture v2.0

## Module Overview

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                    cx330o-dashboard (:80)                                    │
│                    Session Auth → Admin SSO → PWA                           │
├─────────────────────────────────────────────────────────────────────────────┤
│                    cx330o-privacy (Klaro.js GDPR/CCPA)                      │
│                    cx330o-i18n (i18next 50+ languages)                       │
├─────────────────────────────────────────────────────────────────────────────┤
│                    cx330o-infra                                              │
│                    FlowEngine (Workflow) + Analytics (BI)                    │
├──────────┬──────────┬──────────┬──────────┬──────────┬──────────┬───────────┤
│          │          │          │          │          │          │           │
│ cx330o   │ cx330o   │ cx330o   │ cx330o   │ cx330o   │ cx330o   │ cx330o    │
│ leadgen  │ outreach │ contracts│ payments │ crm      │marketing │ support   │
│          │          │          │          │          │          │           │
│ Lead     │ AI Cold  │ E-Sign   │ Payment  │ Customer │ Marketing│ Helpdesk  │
│ Scraping │ Outreach │ DocuSeal │ Gateway  │ Mgmt     │ Auto     │ Tickets   │
├──────────┴──────────┴──────────┴──────────┴──────────┴──────────┴───────────┤
│ cx330o-experiments (A/B Testing)  │  cx330o-voip (Video + AI Voice)         │
│ cx330o-plugins (WhatsApp/IG/TG)  │  cx330o-extensions (ERP/HR)             │
└──────────────────────────────────┴─────────────────────────────────────────┘
```

## Data Flow (Full Sales Cycle)

```
1. cx330o-leadgen scrapes business data (Google Maps / Yelp / OSINT)
       ↓
2. FlowEngine auto-pushes new leads to cx330o-outreach
       ↓
3. cx330o-outreach researches → scores → generates personalized emails → sends
       ↓  (+ cx330o-voip/bolna for AI voice calls)
4. Interested leads receive contracts via cx330o-contracts (DocuSeal)
       ↓
5. Signed contracts trigger payment via cx330o-payments (Hyperswitch)
       ↓
6. Paid customers auto-enter cx330o-crm
       ↓
7. CRM customers enter cx330o-marketing for ongoing engagement
       ↓  (+ cx330o-experiments for A/B testing email/landing pages)
8. Support tickets handled by cx330o-support (Frappe Helpdesk)
       ↓
9. All data flows into Analytics for dashboards
```

## Module Details

### 1. cx330o-leadgen (`cx330o-leadgen/`)

| Component | Path | Description |
|-----------|------|-------------|
| Core Pipeline | `core/` | Async plugin architecture, pipeline orchestration, unified output |
| OSINT Engine | `harvester/` | Multi-source email/subdomain intelligence gathering |
| Maps Scraper | `maps-scraper/` | Google Maps review parsing, rating extraction, pagination |
| Web Scraper | `web-scraper/` | Playwright async scraping, search result extraction |
| AI Enricher | `enricher/` | LLM-powered data enrichment, Google Sheets export |

### 2. cx330o-outreach (`cx330o-outreach/`)

| Component | Path | Description |
|-----------|------|-------------|
| Core Pipeline | `core/` | Research → scoring → email generation → sending |
| Sales Agent | `sales-agent/` | Conversational AI with 8-stage sales model |
| Email Automations | `email-automations/` | Multi-agent collaboration (analyst + writer) |
| Email Manager | `email-manager/` | Template management, scheduling, follow-up chains |
| Email Generator | `email-generator/` | Fast LLM inference for email generation |
| Workflow | `workflow/` | LangGraph state machine with conditional routing |

### 3. cx330o-contracts (`cx330o-contracts/`) — NEW

| Component | Source | Description |
|-----------|--------|-------------|
| DocuSeal | `docuseal` | Document template management, multi-party signing |
| API | REST | Create/manage signing flows programmatically |
| Webhooks | Events | Auto-notify CRM on signature completion |

Key capabilities:
- Drag-and-drop template editor with PDF field annotation
- Multi-party signing (sequential/parallel)
- Electronic signatures (handwritten/typed/image), eIDAS compliant
- Real-time signing status tracking with auto-reminders
- Full REST API for CRM/FlowEngine integration

### 4. cx330o-payments (`cx330o-payments/`) — NEW

| Component | Source | Description |
|-----------|--------|-------------|
| Hyperswitch Server | Rust | Payment routing engine, 50+ connectors |
| Control Center | React | Visual dashboard for payment management |
| Web SDK | JS | Embeddable payment page components |

Key capabilities:
- 50+ payment processors (Stripe/PayPal/Adyen/Klarna/Braintree)
- Smart routing based on success rate, fees, geography
- 135+ currencies with automatic conversion
- Subscription billing, usage-based billing, trial management
- Refund management, dispute handling, auto-reconciliation
- PCI DSS compliant, 3DS authentication

### 5. cx330o-crm (`cx330o-crm/`)

| Component | Path | Description |
|-----------|------|-------------|
| Core | `core/` | CRM deployment with Docker Compose + extensions |
| Platform | `platform/` | Full-featured CRM system (Twenty CRM) |
| ERP Extensions | `erp-extensions/` | PDF invoice/quote generation microservice |
| Email CRM | `email-crm/` | Inbound email parsing via webhook |

### 6. cx330o-marketing (`cx330o-marketing/`)

| Component | Path | Description |
|-----------|------|-------------|
| Core Gateway | `core/` | Unified API gateway routing to all marketing services |
| Journey Builder | `journey/` | Customer journey automation, omnichannel messaging |
| Mailer | `mailer/` | High-performance Go-based email delivery engine |
| Live Chat | `chat/` | Omnichannel conversation management |
| Lead Scoring | `scoring/` | Behavioral scoring algorithms and rules engine |
| Page Builder | `page-builder/` | GrapesJS drag-and-drop landing page builder — NEW |

### 7. cx330o-experiments (`cx330o-experiments/`) — NEW

| Component | Source | Description |
|-----------|--------|-------------|
| GrowthBook | Node.js/React | A/B testing platform with Bayesian statistics |
| Feature Flags | SDK | Gradual rollout, user segmentation, environment isolation |
| Visual Editor | Web | No-code experiment creation |

Key capabilities:
- Multi-variate testing with traffic allocation and auto-stop rules
- Bayesian statistical engine with significance detection
- SDKs for JavaScript/React/Python/Go/Ruby
- Data source integration (BigQuery/Snowflake/Postgres/Mixpanel)

### 8. cx330o-voip (`cx330o-voip/`) — NEW

| Component | Source | Description |
|-----------|--------|-------------|
| MiroTalk SFU | WebRTC | Video conferencing up to 8K, screen sharing, recording |
| Bolna | Python | AI voice agent for automated sales calls |

Key capabilities:
- Browser-based video calls, no installation required
- Screen sharing, virtual backgrounds, recording/playback
- AI voice agent with natural language understanding
- Multi-language voice synthesis (20+ languages)
- Real-time transcription and call summary generation
- Webhook integration for CRM record updates

### 9. cx330o-privacy (`cx330o-privacy/`) — NEW

| Component | Source | Description |
|-----------|--------|-------------|
| Klaro.js | JS | Cookie consent management, script blocking |
| GDPR Analyzer | Python | Automated compliance scanning |
| DSAR Handler | Custom | Data subject access request processing |

Covers: GDPR (EU), CCPA (US), LGPD (Brazil), POPIA (South Africa)

### 10. cx330o-i18n (`cx330o-i18n/`) — NEW

| Component | Source | Description |
|-----------|--------|-------------|
| i18next | JS | Core i18n framework, 50+ languages |
| react-i18next | React | Component-level translation with Hooks |
| Currency | Custom | 135+ currency formatting, real-time rates |

Key capabilities:
- RTL layout support (Arabic/Hebrew)
- AI-assisted translation with context preservation
- Hot-reload translation files without restart
- SSR-friendly for Next.js applications

### 11. cx330o-infra (`cx330o-infra/`)

| Component | Path | Description |
|-----------|------|-------------|
| Core | `core/` | Docker Compose deployment, auto-setup scripts, pre-built workflows |
| FlowEngine | `workflow-engine/` | Visual workflow builder with 400+ integrations |
| Analytics | `analytics/` | No-code BI dashboards with AI-powered queries |

### 12. cx330o-plugins (`cx330o-plugins/`)

| Plugin | Description |
|--------|-------------|
| `whatsapp-crm/` | WhatsApp Business integration with Notion CRM |
| `instagram-crm/` | Instagram DM management with Notion CRM |
| `telegram-crm/` | Telegram bot CRM for education scenarios |
| `line-crm/` | LINE Official Account CRM for studios |

### 13. cx330o-extensions (`cx330o-extensions/`)

Extended ERP and HR capabilities: Dolibarr, ERPNext, Frappe, HRMS.

## Docker Compose Profiles

| Profile | Services | Use Case |
|---------|----------|----------|
| (default) | Dashboard, FlowEngine, Analytics, CRM, PDF, Email | Core platform |
| `marketing` | Journey Builder, Mailer, Live Chat, Scoring | Marketing automation |
| `contracts` | DocuSeal + PostgreSQL | E-signature |
| `payments` | Hyperswitch Server + Control Center + Web SDK | Payment gateway |
| `experiments` | GrowthBook + MongoDB | A/B testing |
| `voip` | MiroTalk + Bolna | Video/voice |
| `all` | Everything above | Full deployment |

## Port Map

| Port | Service | Profile |
|------|---------|---------|
| :80 | Dashboard (Nginx gateway) | default |
| :81 | FlowEngine | default |
| :82 | Analytics | default |
| :83 | CRM | default |
| :84 | DocuSeal (E-Signature) | contracts |
| :85 | Hyperswitch Control Center | payments |
| :86 | GrowthBook (A/B Testing) | experiments |
| :87 | MiroTalk (Video Calls) | voip |
| :3002 | PDF Generator API | default |
| :3003 | Email Parser API | default |
| :3100 | GrowthBook API | experiments |
| :5001 | Bolna AI Voice API | voip |
| :8080 | Marketing Gateway | marketing |
| :8180 | Hyperswitch Payment API | payments |
| :9050 | Hyperswitch Web SDK | payments |
