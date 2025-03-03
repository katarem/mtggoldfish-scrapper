#!/usr/bin/env node

import { Command } from "commander";
import { getRandomDeck, getRandomDeckByLevel, getDeckWithLevel } from "./functions.js";


const program = new Command();

program.name("mtg-random-deck")
    .description("Get a random Magic: The Gathering deck from mtggoldfish.com")
    .version("1.0.0");


program
    .command("level")
    .argument('<pages>', 'Number of pages to search for a deck')
    .argument('<level>', 'Level of the deck')
    .action(async (pages_arg, level_arg) => {
        const pages = pages_arg ? Number.parseInt(pages_arg) : 1;
        const level = level_arg ? Number.parseInt(level_arg) : 3;

        if (isNaN(pages) || pages <= 0) {
            throw new Error('Invalid number of pages. Please provide a positive integer.');
        }

        if (isNaN(level) || level > 10 || pages < 1) {
            throw new Error('Invalid number of level. Please provide a number between 1 and 10.');

        }
        const deck = await getRandomDeckByLevel(pages, level);
        console.log('Obtained deck:',deck);
    });

program
    .command("random")
    .argument('<pages>', 'Number of pages to search for a deck')
    .action(async (pages_arg) => {
        const pages = pages_arg? Number.parseInt(pages_arg) : 1;
        if (isNaN(pages) || pages <= 0) {
            throw new Error('Invalid number of pages. Please provide a positive integer.');
        }
        const deck = await getRandomDeck(pages);
        console.log('Obtained deck:',deck);
    });    





program.parse();