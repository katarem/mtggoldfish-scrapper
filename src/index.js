#!/usr/bin/env node

import { Command } from "commander";
import { getRandomDeck, getRandomDeckByLevel, getDeckWithLevel, getSavedDeck, deleteSavedDeck, updateSavedDeck } from "./functions.js";


const program = new Command();

program.name("mtg-random-deck")
    .description("Get a random Magic: The Gathering deck from mtggoldfish.com")
    .version("1.0.0");


program
    .command("level")
    .description('Get a deck with specified level from mtggoldfish.com')
    .argument('<pages>', 'Number of pages to search for a deck', parseInt, 1)
    .argument('<level>', 'Level of the deck', parseInt, 3)
    .action(async (pages, level) => {
        const deck = await getRandomDeckByLevel(pages, level);
        console.log('Obtained deck:',deck);
    });

program
    .command("random")
    .description('Get a random deck from mtggoldfish.com')
    .argument('<pages>', 'Number of pages to search for a deck', parseInt, 1)
    .action(async (pages) => {
        const deck = await getRandomDeck(pages);
        console.log('Obtained deck:',deck);
    });    

program
    .command("saved")
    .description('get a saved deck with specified name')
    .argument('<name>', 'name of the saved deck')
    .action(async (name_arg) => {
        const name = name_arg;
        console.log(await getSavedDeck(name));
    });


program
    .command("save")
    .description('save a deck from mtggoldfish.com')
    .argument('<url>', 'url of the deck')
    .option('-n, --name <name>', 'name of the deck to save')
    .action(async (url_arg, options) => {
        const url = url_arg;
        const name = options.name;
        console.log(await saveDeck(url, name));
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