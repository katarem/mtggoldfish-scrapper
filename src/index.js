#!/usr/bin/env node

import { Command } from "commander";
import { getRandomDeck, getRandomDeckByLevel, getSavedDeck, deleteSavedDeck, updateSavedDeck, saveDeck, getSavedDecks } from "./functions.js";


const program = new Command();

program.name("mtg-random-deck")
    .description("Get a random Magic: The Gathering deck from mtggoldfish.com")
    .version("1.0.0");


program
    .command("level")
    .description('Get a deck with specified level from mtggoldfish.com')
    .argument('<level>', 'Level of the deck', (value) => parseInt(value, 10), 3)
    .option('-p, --pages <pages>', 'Number of pages to search for a deck', (value) => parseInt(value, 10), 1)
    .action(async (level, options) => {
        const deck = await getRandomDeckByLevel(options.pages, level);
        console.log('Obtained deck:',deck);
    });

program
    .command("random")
    .description('Get a random deck from mtggoldfish.com')
    .option('-p --pages <pages>', 'Number of pages to search for a deck', (value) => parseInt(value, 10), 1)
    .action(async (options) => {
        const deck = await getRandomDeck(options.pages);
        console.log('Obtained deck:',deck);
    });    

program
    .command("saved")
    .description('get all saved decks')
    .action(async () => {
        console.log(await getSavedDecks());
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
        const regex = /^https:\/\/mtggoldfish\.com\/deck\/\d+(#paper)?$/;
        if (!regex.test(url)) {
            console.error('Invalid URL format. URL must match https://mtggoldfish.com/deck/{YOUR_DECK_ID} or https://mtggoldfish.com/deck/{YOUR_DECK_ID}#paper');
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

program.parse();