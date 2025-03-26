# MTG Goldfish Commander Deck Scraper

A TypeScript application that scrapes Commander deck lists from MTGGoldfish.com, analyzes their power level using CommanderSalt.com, and provides deck management functionality.

## Features

- Scrapes Commander deck lists from MTGGoldfish.com
- Analyzes deck power levels using CommanderSalt.com
- Local deck storage with SQLite database
- Configurable performance modes for scraping
- Filter decks by commander, power level, and deck type
- Global CLI command support

## Prerequisites

- Node.js (v14 or higher)
- npm (Node Package Manager)
- SQLite3

## Installation

### From NPM Registry

Install globally from npm:

```bash
npm install -g mtggoldfish-scrapper
```

### Local Installation

1. Clone the repository
2. Install dependencies:
```bash
npm install
```
3. Build the project:
```bash
npm run build
```
4. To use the tool from anywhere in your command line:

```bash
npm install -g .
```

## Usage

The application provides several commands for managing and searching MTG decks:

```bash
mtggoldfish-scrapper [command] [options]
```

### Available Commands

#### Search for Decks
```bash
mtggoldfish-scrapper search [options]

Options:
  -l, --level <number>       Deck power level to filter
  -c, --commander <string>   Commander name to search for
  -t, --type <string>       Deck type to filter
  -p, --pages <number>      Number of pages to fetch (default: 1)
  -r, --random             Get a random deck from results
  -m, --mode <string>      Performance mode (low|medium|high|ultra|fast|ultrafast)
```

#### Manage Local Decks
```bash
# List saved decks
mtggoldfish-scrapper list [options]
  -l, --level <number>      Filter by deck level
  -c, --commander <string>  Filter by commander
  -t, --type <string>      Filter by deck type

# Save a deck
mtggoldfish-scrapper save <url> [options]
  -n, --name <string>      Custom name for the deck

# Get a specific deck
mtggoldfish-scrapper get <id>

# Update a deck
mtggoldfish-scrapper update <id> <url>

# Delete a deck
mtggoldfish-scrapper delete <id>
```

### Examples

```bash
# Search for decks
mtggoldfish-scrapper search -c "Atraxa" -p 3
mtggoldfish-scrapper search -l 8 -t "combo" -m fast

# Get a random deck
mtggoldfish-scrapper search -r -p 5

# Save and manage decks
mtggoldfish-scrapper save https://www.mtggoldfish.com/deck/123456 -n "My Combo Deck"
mtggoldfish-scrapper list -c "Zur"
mtggoldfish-scrapper get abc123
mtggoldfish-scrapper delete abc123
```

## Dependencies

- [Puppeteer](https://www.npmjs.com/package/puppeteer) - Web scraping
- [TypeORM](https://www.npmjs.com/package/typeorm) - Database ORM
- [Commander](https://www.npmjs.com/package/commander) - CLI framework
- [Chalk](https://www.npmjs.com/package/chalk) - Terminal styling