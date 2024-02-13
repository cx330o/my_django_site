# cx330o AI Enricher

AI-powered lead data enrichment module for the cx330o Sales Platform.

## Features

- Google Maps business detail extraction via Selenium
- Automated data processing and cleaning
- Personalized message generation using LLM (ChatGPT API)
- Google Sheets API integration for data export
- Email discovery and validation
- Multiple operation modes (extract, view, export, generate, send)

## Quick Start

```bash
pip install -r requirements.txt
cp .env.example .env  # Add API keys (OPENAI_API_KEY, SPREADSHEET_ID, EMAIL_ADDRESS)
cd src && python main.py
```

## Operation Modes

1. Start extraction — Search and extract business data
2. View dataset — Review extracted data
3. Export to Google Sheets — Transfer data
4. Generate emails — AI-powered personalized messages
5. Production mode — Full pipeline (extract → export → send)

## Tech Stack

- Selenium for web scraping
- OpenAI API for message generation
- Google Sheets API for data export
- BeautifulSoup for HTML parsing

## License

MIT — See root LICENSE file.
