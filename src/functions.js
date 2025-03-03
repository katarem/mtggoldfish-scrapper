import puppeteer, { Browser } from 'puppeteer';

const browser = undefined;
const getBrowser = async () => {
    if (!browser) {
        return await puppeteer.launch({ headless: true });
    }
    return browser;
}

const getDecks = async (numPage, page) => {
    await page.goto(`https://www.mtggoldfish.com/deck/custom/commander?page=${numPage}#paper`)

    const decks = await page.evaluate(() => {
        return Array.from(document.querySelectorAll('.archetype-tile'))
            .map(deck => deck.querySelector('a').href);
    });
    console.log(`Page ${numPage}: ${decks.length} decks`)
    return decks;
}

const getRandomDeck = async (numPages) => {
    const browser = await getBrowser();

    const page = await browser.newPage();
    const saltish = await browser.newPage();
    let decks = []
    for (let index = 1; index < numPages + 1; index++) {
        const pageDecks = await getDecks(index, page);
        decks.push(...pageDecks);
    }
    console.log('Obtained decks:', decks.length)
    const randomDeckNumber = Math.floor(Math.random() * decks.length);
    const randomDeckUrl = decks[randomDeckNumber];
    const randomDeck = await getDeckWithLevel(randomDeckUrl, saltish);
    browser.close();
    return randomDeck;
}

const getRandomDeckByLevel = async (numPages, level) => {
    const browser = await getBrowser();
    const decks = [];
    
    // Obtener todos los links de decks primero
    const goldfish = await browser.newPage();
    const allDeckUrls = [];
    
    for (let index = 1; index < numPages + 1; index++) {
        const pageDecks = await getDecks(index, goldfish);
        allDeckUrls.push(...pageDecks);
    }
    console.log('Total deck URLs found:', allDeckUrls.length);

    // Crear un pool de páginas para procesar los niveles en paralelo
    const MAX_CONCURRENT = 10; // Ajusta este número según tu CPU/memoria
    const pages = await Promise.all(
        Array(MAX_CONCURRENT).fill(0).map(() => browser.newPage())
    );

    // Procesar los decks en chunks
    const chunkSize = Math.ceil(allDeckUrls.length / MAX_CONCURRENT);
    const chunks = Array(MAX_CONCURRENT).fill().map((_, index) => 
        allDeckUrls.slice(index * chunkSize, (index + 1) * chunkSize)
    );

    try {
        const results = await Promise.all(
            chunks.map((chunk, index) => 
                processChunk(chunk, pages[index], level)
            )
        );

        // Combinar resultados
        const filteredDecks = results.flat().filter(deck => deck && deck.level === level);
        console.log('Decks of level', level + ':', filteredDecks.length);

        const randomDeckNumber = Math.floor(Math.random() * filteredDecks.length);
        return filteredDecks[randomDeckNumber];
    } finally {
        // Cerrar todas las páginas y el navegador
        await Promise.all(pages.map(page => page.close()));
        await browser.close();
    }
};

// Función auxiliar para procesar un chunk de URLs
const processChunk = async (urls, page, targetLevel) => {
    const results = [];
    for (const url of urls) {
        try {
            const deckWithLevel = await getDeckWithLevel(url, page);
            if (deckWithLevel.level === targetLevel) {
                results.push(deckWithLevel);
            }
        } catch (error) {
            console.error('Failed to get deck details:', url);
        }
    }
    return results;
};

const getDeckWithLevel = async (deck, page) => {

    await page.goto('https://www.commandersalt.com')

    await page.waitForSelector('input[inputmode="url"]')

    await page.type('input[inputmode="url"]', deck);

    await page.keyboard.press('Enter')

    await page.waitForSelector('span#recharts_measurement_span')

    const level = await page.evaluate(() => {
        return Array.from(document.querySelectorAll('span')).map(e => e.textContent)
            .filter(e => e.startsWith('Absolute (uncapped)'))
            .map(e => Number.parseInt(e.split(': ')[1]))
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


    const stats = {
        link: deck,
        user: commanderInfo[1],
        commander: commanderInfo[2],
        level,
        type: gradesScore[4],
        grades: {
            saltiness: `${grades[0]} ${gradesScore[0]}`,
            interaction: `${grades[1]} ${gradesScore[1]}`,
            wincons: `${grades[2]} ${gradesScore[2]}`,
            synergy: `${grades[3]} ${gradesScore[3]}`,
        }
    }

    return stats;
}


export { getRandomDeck, getDeckWithLevel, getRandomDeckByLevel };