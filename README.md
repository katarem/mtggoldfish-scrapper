# MTG Goldfish Commander Deck Scraper

A Node.js application that scrapes Commander deck lists from MTGGoldfish.com and returns a random deck URL.

## Features

- Scrapes Commander deck lists from MTGGoldfish.com
- Configurable number of pages to scrape via command line argument
- Returns a random deck URL from the collected decks
- Uses Puppeteer for web scraping
- Global CLI command support

## Prerequisites

- Node.js (v14 or higher)
- npm (Node Package Manager)

## Installation

### Local Installation

1. Clone the repository
2. Install dependencies:
```bash
npm install
```

### Global Installation

To use the tool from anywhere in your command line:

```bash
npm install -g .
```

## Usage

### As a local package:

```bash
npm start [pages]
```

### As a global command:

After global installation, you can use the `rdeck` command from anywhere:

```bash
rdeck [pages]
```

Where `[pages]` is an optional argument to specify the number of pages to scrape. If not provided, it defaults to 5 pages.

Examples:
```bash
rdeck      # Scrapes 5 pages (default)
rdeck 10   # Scrapes 10 pages
rdeck 1    # Scrapes just 1 page
```

The script will:
1. Scrape the specified number of Commander deck pages from MTGGoldfish
2. Display the number of decks found on each page
3. Show the total number of decks collected
4. Output a random deck URL from the collection

## Project Structure

- src/
  - index.js - Main entry point and CLI command
  - functions.js - Core scraping functionality
- package.json - Project configuration and dependencies

## Dependencies

- [Puppeteer](https://www.npmjs.com/package/puppeteer) (^24.3.0) - Headless Chrome Node.js API

## License

ISC