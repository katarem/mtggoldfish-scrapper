#!/usr/bin/env node

import { Command } from "commander";
import CardWebsite from "./model/cardwebsite.js";
import { getEnumValue } from "./utils/utils.js";
import SearchOptions from "./model/searchoptions.js";
import chalk from "chalk";
import CommandService from "./service/commandservice.js";
import { PerformanceValue } from "./model/performance.js";

import "reflect-metadata";
import { AppDataSource } from "./data-source.js";

const program: Command = new Command();

let service: CommandService = new CommandService();

program
    .name('mtggoldfish-scrapper')
    .description('CLI for getting decks from different MTG sites')
    .version("6.0.0");

program
    .command('search')
    .description('Search for decks')
    .option('-l --level <level>', 'deck level to search for', (arg) => parseInt(arg, 10), 0)
    .option('-c --commander <commander>', 'Commander to search for')
    .option('-w --web <web>', 'Web to fetch cards from', (arg) => arg ? getEnumValue(CardWebsite, arg) : CardWebsite.GOLDFISH, CardWebsite.GOLDFISH)
    .option('-t --type <type>', 'Deck Type')
    .option('-p --pages <pages>', 'Number of pages to fetch', (arg) => parseInt(arg, 10), 1)
    .option('-r --random', 'Gets a Random Deck from the search', false)
    .option('-m --mode <mode>', 'Mode to fectch', (arg) => arg ? getEnumValue(PerformanceValue, arg) : PerformanceValue.MEDIUM, PerformanceValue.MEDIUM)
    .action(async (options: SearchOptions) => {
        await AppDataSource.initialize();
        if (options.random) {
            const deck = await service.getRandom(options);
            console.log(chalk.green(`Found a random deck:`), deck);
            return;
        }
        const decks = await service.search(options);
        console.log(chalk.green(`Found ${decks.length} decks:`), decks);
    });

program.parse()