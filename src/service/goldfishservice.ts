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

    getDecksByLevel(level: number): Promise<Deck[]> {
        return new Promise<Deck[]>(async (resolve) => {
            await this.getBrowser();
            const page = await this.browser!!.newPage();

            const allDeckUrls = await this.getDecks(page);
            console.log();
            console.log('Total deck URLs found:', allDeckUrls.length);

            const MAX_CONCURRENT = this.performance.getConcurrentPages();
            const pages = await Promise.all(
                Array(MAX_CONCURRENT).fill(0).map(() => this.browser!!.newPage())
            );

            const chunkSize = Math.ceil(allDeckUrls.length / MAX_CONCURRENT);
            const chunks: string[][] = Array(MAX_CONCURRENT).fill(MAX_CONCURRENT).map((_, index) =>
                allDeckUrls.slice(index * chunkSize, (index + 1) * chunkSize)
            );

            this.progress = new TqdmProgress({
                total: allDeckUrls.length,
                description: 'Processing deck levels',
                unit: 'deck',
                progressBraces: ['', ''],
                step: 1
            })
            const results = await Promise.all(
                chunks.map((chunk, index) =>
                    this.processChunk(chunk, pages[index], level, this.progress)
                )
            );
            console.log();
            let filteredDecks;
            if (level > 0) {
                filteredDecks = results.flat().filter(deck => deck && deck.level === level);
                console.log('Decks of level', level + ':', filteredDecks.length);
            } else {
                filteredDecks = results.flat().filter(deck => deck);
            }
            await Promise.all(pages.map(page => page.close()));
            await this.browser?.close();
            resolve(filteredDecks);
        });
    };

    private async processChunk(urls: string[], page: Page, targetLevel: number, progress: TqdmProgress): Promise<Deck[]> {
        return new Promise<Deck[]>(async (resolve) => {
            const results: Deck[] = [];
            for (const url of urls) {
                try {
                    const deckWithLevel = await this.getDeckWithLevel(url, page);
                    if (targetLevel === 0 || deckWithLevel.level === targetLevel) {
                        results.push(deckWithLevel);
                    }
                } catch (error) {
                    // ignoring error
                } finally {
                    progress.update();
                }
            }
            resolve(results);
        });
    };


}

export default GoldFishService;