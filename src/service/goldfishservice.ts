import { Page } from "puppeteer";
import { TqdmProgress } from "node-console-progress-bar-tqdm";
import { Performance, PerformanceValue } from "../model/performance.js";
import { Deck } from "../model/deck.js";
import CardService from "./cardservice.js";

class GoldFishService extends CardService {


    pages: number = 1;
    performance: Performance = new Performance(PerformanceValue.MEDIUM);

    constructor() {
        super();
        this.website = 'https://www.mtggoldfish.com/deck/custom/commander';
    }

    setPages(pages: number) {
        this.pages = pages;
    }

    setPerformance(performance: Performance) {
        this.performance = performance;
    }

    fetchDecks(page: Page): Promise<string[]> {
        return new Promise<string[]>(async (resolve) => {
            const decks = await page.evaluate(() => {
                return Array.from(document.querySelectorAll('.archetype-tile'))
                    .map(deck => deck.querySelector('a'))
                    .map(link => link ? link.href : '')
                    .filter(deck => deck !== '');
            });
            resolve(decks);
        })
    };

    getDecks(page: Page): Promise<string[]> {
        return new Promise<string[]>(async (resolve) => {
            this.progress = new TqdmProgress({
                total: 30 * this.pages,
                description: 'Searching decks',
                unit: 'deck',
                progressBraces: ['', ''],
                step: 30,
            });
            const deckUrls: string[] = [];
            for (let index = 1; index < this.pages + 1; index++) {
                try {
                    await page.goto(`https://www.mtggoldfish.com/deck/custom/commander?page=${index}#paper`)
                    const pageDecks = await this.fetchDecks(page);
                    deckUrls.push(...pageDecks);
                    this.progress.update();
                } catch (e) {
                    // ignore
                }
            }
            resolve(deckUrls);
        });
    }

    getDeck(url: string): Promise<Deck | null> {
        return new Promise<Deck | null>(async (resolve, reject) => {
            try {
                await this.getBrowser();
                const page = await this.browser!!.newPage();
                const deck = await this.getDeckWithLevel(url, page);
                await this.browser!!.close();
                resolve(deck);
            } catch (error) {
                reject(error);
            }
        });
    }

    


}

export default GoldFishService;