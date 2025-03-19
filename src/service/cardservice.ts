import { TqdmProgress } from "node-console-progress-bar-tqdm";
import puppeteer, { Browser, Page } from "puppeteer";
import { Deck } from "../model/deck.js";
import { Performance, PerformanceValue } from "../model/performance.js";
abstract class CardService {

    browser: Browser | undefined;
    website: string;
    protected static LEVEL_WEBSITE: string = 'https://www.commandersalt.com';
    performance: Performance = new Performance(PerformanceValue.MEDIUM);
    progress: TqdmProgress;

    constructor() {
        this.website = CardService.LEVEL_WEBSITE;
        this.progress = new TqdmProgress({});
    }

    async getBrowser() {
        if (!this.browser)
            this.browser = await puppeteer.launch({ headless: true });
        return this.browser;
    }

    abstract fetchDecks(page: Page): Promise<string[]>;
    abstract getDecks(page: Page): Promise<string[]>;

    getDeckWithLevel(url: string, page: Page): Promise<Deck> {
        return new Promise<Deck>(async (resolve, reject) => {
            try {
                await this.getBrowser();
                await page.goto(CardService.LEVEL_WEBSITE);

                await page.waitForSelector('input[inputmode="url"]')

                await page.type('input[inputmode="url"]', url);

                await page.keyboard.press('Enter')

                await page.waitForSelector('span#recharts_measurement_span')

                page.setDefaultTimeout(5000)

                const level = await page.evaluate(() => {
                    return Array.from(document.querySelectorAll('span')).map(e => e.textContent)
                        .filter(e => e?.startsWith('Absolute (uncapped)'))
                        .map(e => e ? Number.parseInt(e.split(': ')[1]) : 0)
                        .pop();
                });

                const grades = await page.evaluate(() => {
                    return Array.from(document.querySelectorAll('span'))
                        .filter(e => e.className === 'reportCardGradeLetter')
                        .map(e => e.textContent)
                });

                const gradesScore = await page.evaluate(() => {
                    return Array.from(document.querySelectorAll('span'))
                        .filter(e => e.className === 'reportCardScore')
                        .map(e => e.textContent)
                });

                const commanderInfo = await page.evaluate(() => {
                    return Array.from(document.querySelectorAll('.previewDeckCommandersText'))
                        .map(e => e.textContent)
                });

                const deckType = gradesScore[4] ? gradesScore[4].replace('MIDRANGE /', '').trim() : 'UNKNOWN';

                const deckLink = url.endsWith('#paper') ? url : url + '#paper';
                const stats: Deck = {
                    link: deckLink,
                    user: commanderInfo[1] ? commanderInfo[1] : 'UNKNOWN USER',
                    commander: commanderInfo[2] ? commanderInfo[2] : 'UNKNOWN COMMANDER',
                    level: level ? level : 0,
                    type: deckType,
                    grades: {
                        saltiness: `${grades[0]} ${gradesScore[0]}`,
                        interaction: `${grades[1]} ${gradesScore[1]}`,
                        wincons: `${grades[2]} ${gradesScore[2]}`,
                        synergy: `${grades[3]} ${gradesScore[3]}`,
                    }
                }

                resolve(stats);
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

    protected async processChunk(urls: string[], page: Page, targetLevel: number, progress: TqdmProgress): Promise<Deck[]> {
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

export default CardService;