#!/usr/bin/env node

import { Command } from "commander";
import { getSavedDeck, deleteSavedDeck, updateSavedDeck, saveDeck, getSavedDecks, searchDecks } from "./functions.js";
import chalk from "chalk";

const program = new Command();

program
    .name("mtg-random-deck")
    .description("Get a random Magic: The Gathering deck from mtggoldfish.com")
    .version('5.0.0');

program
    .command("list")
    .description('lists all saved decks')
    .option('-t --type <type>', 'Type of the deck')
    .option('-l --level <level>', 'Level of the deck', (value) => parseInt(value, 10))
    .option('-c --commander <commander>', 'Commander of the deck')
    .action(async (options) => {
        console.log(await getSavedDecks(options));
    });

program
    .command("get")
    .description('get a saved deck with specified name')
    .argument('<name>', 'name of the saved deck')
    .action(async (name_arg) => {
        const name = name_arg;
        console.log(await getSavedDeck(name));
    });

program
    .command("save")
    .description('save a deck from mtggoldfish.com')
    .argument('<url>', 'url of the deck', (url) => {
        const regex = /^https:\/\/www\.mtggoldfish\.com\/deck\/\d+#paper$/;
        if (!regex.test(url)) {
            console.log(chalk.red('Invalid URL format. URL must match https://mtggoldfish.com/deck/{YOUR_DECK_ID}#paper'));
            process.exit(1);
        }
        return url;
    })
    .option('-n, --name <name>', 'name of the deck to save')
    .action(async (url_arg, options) => {
        const url = url_arg;
        const name = options.name;
        console.log(await saveDeck(name, url));
    });

program
    .command("delete")
    .description('deletes a saved deck')
    .argument('<name>', 'name of the saved deck')
    .action(async (name_arg) => {
        const name = name_arg;
        console.log(await deleteSavedDeck(name));
    });

program
    .command("update")
    .description('updates a saved deck')
    .argument('<name>', 'name of the saved deck')
    .argument('<url>', 'url of the deck')
    .action(async (name_arg, url_arg) => {
        const name = name_arg;
        const url = url_arg;
        console.log(await updateSavedDeck(name, url));
    });

program
    .command("search")
    .description('search for a deck with filters')
    .option('-t --type <type>', 'Type of the deck')
    .option('-l --level <level>', 'Level of the deck', (value) => parseInt(value, 10))
    .option('-c --commander <commander>', 'Commander of the deck')
    .option('-p --pages <pages>', 'Number of pages to search for a deck', (value) => parseInt(value, 10), 1)
    .option('-m --mode <mode>', 'Mode of fetching deck', 'normal')
    .option('-r --random', 'Random deck')
    .action(async (options) => {
        if (!['low', 'normal', 'high', 'ultra', 'fast', 'ultrafast'].includes(options.mode))
            console.log(chalk.red('Invalid mode. Mode must be one of:'), 'low, normal, high, ultra, fast, ultrafast');
        else if (!options.type && !options.level && !options.commander)
            console.log(chalk.red("Can't search decks with no options"))
        else if (options.random) {
            const decks = await searchDecks(options.pages, options);
            const deckIndex = Math.floor(Math.random() * decks.length);
            console.log('Obtained deck:', decks[deckIndex]);
        }
        else console.log(await searchDecks(options.pages, options));
    });

program.parse();