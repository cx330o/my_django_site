# cx330o Web Scraper

Playwright-based web scraping engine for the cx330o Sales Platform.

## Features

- Google Maps business data extraction
- Yelp business search and extraction
- Async parallel scraping with Playwright
- CSV export
- Configurable search queries and locations

## Quick Start

```bash
pip install -r requirements.txt
python run.py
```

```python
import asyncio
from py_lead_generation import GoogleMapsEngine, YelpEngine

async def main():
    engine = GoogleMapsEngine("Barbershop", "Paris", zoom=12)
    await engine.run()
    engine.save_to_csv()

asyncio.run(main())
```

## License

MIT — See root LICENSE file.
