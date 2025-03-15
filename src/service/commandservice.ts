import chalk from "chalk";
import SearchOptions from "../model/searchoptions.js";
import CardWebsite from "../model/cardwebsite.js";
import GoldFishService from "./goldfishservice.js";
import { Deck } from "../model/deck.js";
import { Performance } from "../model/performance.js";
class CommandService {

    goldfishService: GoldFishService;

    constructor() {
        this.goldfishService = new GoldFishService();
    }

    async search(options: SearchOptions): Promise<Deck[]> {
        return new Promise<Deck[]>(async (resolve) => {
            if (!options.web) {
                console.log(chalk.red('Invalid website.'))
                process.exit(1)
            }
            switch (options.web) {
                case CardWebsite.GOLDFISH:
                    this.goldfishService.setPages(options.pages ? options.pages : 1);
                    this.goldfishService.setPerformance(new Performance(options.mode));
                    let decks: Deck[] = await this.goldfishService.getDecksByLevel(options.level);
                    if (options.commander) {
                        decks = decks.filter(deck => options.commander ? deck.commander.toLocaleLowerCase().includes(options.commander?.toLocaleLowerCase()) : true)
                        console.log(chalk.blue('Decks found with commander matching'), chalk.underline(options.commander), chalk.blue(options.level !== 0 ? `of level ${options.level}` : '' + ':'), decks.length)
                    }
                    if (options.type) {
                        decks = decks.filter(deck => options.type ? deck.type.toLocaleLowerCase().includes(options.type?.toLocaleLowerCase()) : true)
                        console.log(chalk.blue('Decks found with type', chalk.underline(options.type), chalk.blue(':'), decks.length))
                    }
                    resolve(decks);
                    break;
                case CardWebsite.MOXFIELD:
                    // TODO: Implement MoxfieldService
                    console.log(chalk.red('Moxfield is not supported yet.'))
                    process.exit(1);
            }
        });
    }

    async getRandom(options: SearchOptions): Promise<Deck> {
        return new Promise<Deck>(async (resolve) => {
            const decks = await this.search(options);
            if (decks.length === 0) {
                console.log(chalk.red('No cards found matching the search criteria.'))
                process.exit(1)
            }
            const randomIndex = Math.floor(Math.random() * decks.length);
            resolve(decks[randomIndex]);
        });
    }

}

export default CommandService;