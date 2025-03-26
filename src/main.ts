#!/usr/bin/env node

import { Command } from "commander";
import { getEnumValue } from "./utils/utils.js";
import SearchOptions from "./model/searchoptions.js";
import chalk from "chalk";
import CommandService from "./service/commandservice.js";
import { PerformanceValue } from "./model/performance.js";

import "reflect-metadata";
import { randomUUID } from "crypto";

const program: Command = new Command();

let commandService: CommandService = new CommandService();
program
    .name('mtggoldfish-scrapper')
    .description('CLI for getting decks from different MTG sites')
    .version("6.1.0");

program
    .command('search')
    .description('Search for decks')
    .option('-l --level <level>', 'deck level to search for', (arg) => parseInt(arg, 10), 0)
    .option('-c --commander <commander>', 'Commander to search for')
    .option('-t --type <type>', 'Deck Type')
    .option('-p --pages <pages>', 'Number of pages to fetch', (arg) => parseInt(arg, 10), 1)
    .option('-r --random', 'Gets a Random Deck from the search', false)
    .option('-m --mode <mode>', 'Mode to fectch', (arg) => arg ? getEnumValue(PerformanceValue, arg) : PerformanceValue.MEDIUM, PerformanceValue.MEDIUM)
    .action(async (options: SearchOptions) => {
        if (options.random) {
            const deck = await commandService.getRandom(options);
            console.log(chalk.green(`Found a random deck:`), deck);
            return;
        }
        const decks = await commandService.search(options);
        console.log(chalk.green(`Found ${decks.length} decks:`), decks);
    });

program
    .command('list')
    .description('List all local decks')
    .option('-l --level <level>', 'deck level to search for', (arg) => parseInt(arg, 10), 0)
    .option('-c --commander <commander>', 'Commander to search for')
    .option('-t --type <type>', 'Deck Type')
    .action(async (filters: SearchOptions) => {
        const decks = await commandService.getAllDecks(filters);
        console.log(chalk.green(`Found ${decks.length} local decks:`), decks);
    });

program
    .command('save')
    .description('Save a deck to local storage')
    .option('-n --name <name>', 'Deck Name', randomUUID().toString())
    .argument('<link>', 'Deck URL to save')
    .action(async (link: string, options: { name: string }) => {
        await commandService.saveDeck(link, options.name);
    });

program
    .command('get')
    .description('Get a deck from local storage')
    .argument('<id>', 'Deck ID to get')
    .action(async (id: string) => {
        const deck = await commandService.getLocalDeck(id);
        if (deck) console.log(chalk.green(`Found deck:`), deck);
        else console.log(chalk.red(`Deck not found with ID: ${id}`));
    });

program
    .command('update')
    .description('Update a deck from local storage')
    .argument('<id>', 'Deck ID to get')
    .argument('<link>', 'Link to the deck')
    .action(async (id: string, link: string) => {
        const deck = await commandService.updateDeck(id, link);
        if (deck) console.log(chalk.green(`Updated deck with ID:`), id);
        else console.log(chalk.red(`Deck not found with ID:`), id);
    });

program
    .command('delete')
    .description('Delete a deck from local storage')
    .argument('<id>', 'Deck ID to get')
    .action(async (id: string) => {
        const deck = await commandService.deleteDeck(id);
        if (deck) console.log(chalk.green(`Deleted deck with ID:`), id);
        else console.log(chalk.red(`Deck not found with ID:`), id);
    });


program.parse()