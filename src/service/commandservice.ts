import chalk from "chalk";
import SearchOptions from "../model/searchoptions.js";
import CardWebsite from "../model/cardwebsite.js";
import GoldFishService from "./goldfishservice.js";
import { Deck } from "../model/deck.js";
import { Performance } from "../model/performance.js";
import { getEnumValue } from "../utils/utils.js";
import { LocalDeck } from "../entity/localdeck.js";
import { DatabaseService } from "./databaseservice.js";
import { mapToEntity } from "../mapper/mapper.js";
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
                case CardWebsite.MTGGOLDFISH:
                    this.goldfishService.setPages(options.pages ? options.pages : 1);
                    this.goldfishService.setPerformance(new Performance(options.mode));
                    let decks: Deck[] = await this.goldfishService.getDecksByLevel(options.level);
                    if (options.commander) {
                        decks = decks.filter(deck => options.commander ? deck.commander.toLocaleLowerCase().includes(options.commander?.toLocaleLowerCase()) : true)
                        console.log(chalk.blue('Decks found with commander matching'), '\'' + chalk.underline(options.commander) + '\'', chalk.blue(options.level !== 0 ? `of level ${options.level}` : '' + ':'), decks.length)
                    }
                    if (options.type) {
                        decks = decks.filter(deck => options.type ? deck.type.toLocaleLowerCase().includes(options.type?.toLocaleLowerCase()) : true)
                        if (options.commander)
                            console.log(chalk.blue('Decks found with type matching'), '\'' + chalk.underline(options.type) + '\'', chalk.blue('and commander matching'), '\'' + chalk.underline(options.commander) + '\'', chalk.blue(':'), decks.length)
                        else
                            console.log(chalk.blue('Decks found with type matching'), '\'' + chalk.underline(options.type) + '\'', chalk.blue(':'), decks.length);
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


    async getDeck(link: string): Promise<Deck | null> {
        return new Promise<Deck | null>(async (resolve, reject) => {
            const web = getEnumValue(CardWebsite, link.split('.')[1]);
            switch (web) {
                case CardWebsite.MTGGOLDFISH:
                    const deck = await this.goldfishService.getDeck(link);
                    if (!deck) {
                        console.log(chalk.red('Deck not found on Goldfish.'));
                        resolve(null);
                        break;
                    }
                    resolve(deck);
                    break;
                case CardWebsite.MOXFIELD:
                    console.log(chalk.red('Moxfield is not supported yet.'));
                    resolve(null);
                    break;
                case undefined:
                    console.log(chalk.red('Invalid website.'));
                    resolve(null);
                    break;
            }
        });
    }

    async getLocalDeck(id: string): Promise<LocalDeck | null> {
        return new Promise<LocalDeck | null>(async (resolve) => {
            const databaseService = await DatabaseService.getInstance();
            const deck = await databaseService.getDeck(id);
            await databaseService.close();
            resolve(deck);
        });
    }

    async saveDeck(link: string, name: string): Promise<void> {
        return new Promise<void>(async (resolve) => {
            const deck = await this.getDeck(link);
            if (deck) {
                const databaseService = await DatabaseService.getInstance();
                const localDeck = mapToEntity(deck, name);
                const deckSaved = await databaseService.saveDeck(localDeck);
                if (deckSaved) console.log(chalk.green(`Saved deck: ${deckSaved.id}`));
                else console.log(chalk.red(`Failed to save deck: ${name}`));
                await databaseService.close();
            }
            resolve();
        });
    }

    async updateDeck(id: string, link: string): Promise<boolean> {
        return new Promise<boolean>(async (resolve) => {
            const deck = await this.getDeck(link);
            if (deck) {
                const databaseService = await DatabaseService.getInstance();
                const localDeck = mapToEntity(deck, id);
                console.log('local', localDeck);
                const updated = await databaseService.updateDeck(id, localDeck);
                await databaseService.close();
                resolve(updated);
            } else {
                resolve(false);
            }
        });
    }

    async deleteDeck(id: string): Promise<boolean> {
        return new Promise<boolean>(async (resolve) => {
            const databaseService = await DatabaseService.getInstance();
            const deleted = await databaseService.deleteDeck(id);
            await databaseService.close();
            resolve(deleted);
        });
    }

    async getAllDecks(filters: SearchOptions): Promise<LocalDeck[]> {
        return new Promise<LocalDeck[]>(async (resolve) => {
            const databaseService = await DatabaseService.getInstance();
            let decks = await databaseService.getAll();
            await databaseService.close();

            if(filters && filters.commander) 
                decks = decks.filter(deck => deck.commander.toLocaleLowerCase().includes(filters!!.commander!!.toLocaleLowerCase()));
            if(filters && filters.type)
                decks = decks.filter(deck => deck.type.toLocaleLowerCase().includes(filters!!.type!!.toLocaleLowerCase()));
            if(filters && filters.level)
                decks = decks.filter(deck => deck.level === filters.level);
            
            resolve(decks);
        });
    }

}

export default CommandService;