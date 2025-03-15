import { Command } from "commander";
import CardWebsite from "./model/cardwebsite";
import { getEnumValue } from "./utils/utils";
import SearchOptions from "./model/searchoptions";
import chalk from "chalk";
import CommandService from "./service/commandservice";

const program: Command = new Command();

let service: CommandService = new CommandService();

program
    .createCommand('search')
    .description('Search for decks')
    .option('-l --level <level>', 'deck level to search for', (arg) => parseInt(arg, 10), 0)
    .option('-c --commander <commander>', 'Commander to search for')
    .option('-w --web <web>', 'Web to fetch cards from', (arg) => arg ? getEnumValue(CardWebsite, arg) : CardWebsite.GOLDFISH, CardWebsite.GOLDFISH)
    .action(async (options: SearchOptions) => {
        const decks = await service.search(options);
        console.log(chalk.green(`Found ${decks.length} decks:`, decks));
    });

program.parse()