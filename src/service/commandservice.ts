import chalk from "chalk";
import SearchOptions from "../model/searchoptions";
import CardWebsite from "../model/cardwebsite";
import GoldFishService from "./goldfishservice";

class CommandService {

    goldfishService: GoldFishService;

    constructor() {
        this.goldfishService = new GoldFishService();
    }

    async search(options: SearchOptions): Promise<Deck[]> {
        return new Promise<Deck[]>(async (resolve, reject) => {
            if (!options.web) {
                console.log(chalk.red('Invalid website.'))
                process.exit(1)
            }
            switch (options.web) {
                case CardWebsite.GOLDFISH:
                    this.goldfishService.setPages(options.pages ? options.pages : 1);
                    let decks: Deck[] = await this.goldfishService.getDecksByLevel(options.level);
                    if (options.type)
                        decks = decks.filter(deck => options.type ? deck.type.toLocaleLowerCase().includes(options.type?.toLocaleLowerCase()) : true)
                    if (options.commander)
                        decks = decks.filter(deck => options.commander ? deck.commander.toLocaleLowerCase().includes(options.commander?.toLocaleLowerCase()) : true)
                    resolve(decks);
                case CardWebsite.MOXFIELD:
                    // TODO: Implement MoxfieldService
                    console.log(chalk.red('Moxfield is not supported yet.'))
                    process.exit(1)
                    break;
                default:
            }
        });
    }

    async getRandom(options: SearchOptions): Promise<Deck> {
        return new Promise<Deck>(async (resolve, reject) => {
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