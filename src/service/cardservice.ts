import { TqdmProgress } from "node-console-progress-bar-tqdm";
import puppeteer, { Browser, Page } from "puppeteer";
abstract class CardService {

    browser: Browser | undefined;
    website: string;
    protected static LEVEL_WEBSITE: string = 'https://www.commandersalt.com';
    progress: TqdmProgress;

    constructor() {
        this.website = CardService.LEVEL_WEBSITE;
        this.progress = new TqdmProgress({});
    }

    async getBrowser() {
        if (!this.browser)
            this.browser = await puppeteer.launch({ headless: false });
        return this.browser;
    }

    abstract fetchDecks(page: Page): Promise<string[]>;
    abstract getDecks(page: Page): Promise<string[]>;
    abstract getDecksByLevel(level: number): Promise<Deck[]>;

    getDeckWithLevel(url: string, page: Page): Promise<Deck> {
        return new Promise<Deck>(async (resolve) => {
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
                name: null,
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
        });

    }


}

export default CardService;