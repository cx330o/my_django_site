# cx330o Maps Scraper

Google Maps review and business data scraper for the cx330o Sales Platform.

## Features

- Google Maps business data extraction
- Review scraping with pagination
- Rating and review count parsing
- Multi-language support
- CSV output

## Quick Start

```bash
pip install -r requirements.txt
python query_reviews.py
```

## Usage

1. Open `query_reviews.py`
2. Set `google_map_url` to the target Google Maps URL
3. Optionally adjust `n_reviews` for review count
4. Run the script
5. Results saved to `outputs.csv`

## Output Fields

- retrieval_date, rating, relative_date, user_name, text, etc.

## License

MIT — See root LICENSE file.
