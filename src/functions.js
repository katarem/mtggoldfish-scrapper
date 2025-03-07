import puppeteer from 'puppeteer';
import fs from 'fs';
import { randomUUID } from 'crypto';
import { getFileDecks, saveToFile } from './paths.js';
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

const getDecksByLevel = async (numPages, level) => {
    const browser = await getBrowser();

    const goldfish = await browser.newPage();
    const allDeckUrls = [];

    for (let index = 1; index < numPages + 1; index++) {
        const pageDecks = await getDecks(index, goldfish);
        allDeckUrls.push(...pageDecks);
    }
    console.log('Total deck URLs found:', allDeckUrls.length);

    const MAX_CONCURRENT = 10;
    const pages = await Promise.all(
        Array(MAX_CONCURRENT).fill(0).map(() => browser.newPage())
    );

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
        let filteredDecks;
        if (level > 0) {
            filteredDecks = results.flat().filter(deck => deck && deck.level === level);
            console.log('Decks of level', level + ':', filteredDecks.length);
        } else {
            filteredDecks = results.flat().filter(deck => deck);
        }
        return filteredDecks;
    } finally {
        await Promise.all(pages.map(page => page.close()));
        await browser.close();
    }
};

const getRandomDeckByLevel = async (numPages, level) => {
    const decks = await getDecksByLevel(numPages, level);
    const randomDeckNumber = Math.floor(Math.random() * decks.length);
    return decks[randomDeckNumber];
}

// Función auxiliar para procesar un chunk de URLs
const processChunk = async (urls, page, targetLevel) => {
    const results = [];
    for (const url of urls) {
        try {
            const deckWithLevel = await getDeckWithLevel(url, page);
            if (targetLevel === 0 || deckWithLevel.level === targetLevel) {
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

    const deckType = gradesScore[4].replace('MIDRANGE /', '').trim();

    const deckLink = deck.endsWith('#paper') ? deck : deck + '#paper';
    const stats = {
        link: deckLink,
        user: commanderInfo[1],
        commander: commanderInfo[2],
        level,
        type: deckType,
        grades: {
            saltiness: `${grades[0]} ${gradesScore[0]}`,
            interaction: `${grades[1]} ${gradesScore[1]}`,
            wincons: `${grades[2]} ${gradesScore[2]}`,
            synergy: `${grades[3]} ${gradesScore[3]}`,
        }
    }

    return stats;
}

const getSavedDecks = async (options) => {
    const deckMap = await getFileDecks();
    let filteredDeckMap = { ...deckMap };

    if (options.commander) {
        filteredDeckMap = Object.fromEntries(
            Object.entries(filteredDeckMap).filter(([_, deck]) => deck.commander.toLowerCase().includes(options.commander.toLowerCase()))
        );
    }
    if (options.level) {
        filteredDeckMap = Object.fromEntries(
            Object.entries(filteredDeckMap).filter(([_, deck]) => deck.level === options.level)
        );
    }
    if (options.type) {
        filteredDeckMap = Object.fromEntries(
            Object.entries(filteredDeckMap).filter(([_, deck]) => deck.type.toLowerCase().includes(options.type.toLowerCase()))
        );
    }

    return filteredDeckMap;
}

const saveDeck = async (name, deckURL) => {
    const browser = await getBrowser();
    const page = await browser.newPage();
    const deck = await getDeckWithLevel(deckURL, page);
    let userDecks = await getFileDecks();
    const id = name ? name : randomUUID().toString();
    userDecks = {
        ...userDecks,
        [id]: deck,
    }
    browser.close();
    await saveToFile(userDecks);
    return `Deck saved: ${id}`;
}

const getSavedDeck = async (name) => {
    const userDecks = await getFileDecks();
    if (!userDecks[name])
        return `Deck not found: ${name}`;
    return {
        name,
        ...userDecks[name]
    };
}

const deleteSavedDeck = async (name) => {
    const userDecks = await getFileDecks();
    if (!userDecks[name])
        return 'Deck not found';
    delete userDecks[name];
    await saveToFile(userDecks);
    return `Deck deleted: ${name}`;
}

const updateSavedDeck = async (name, deckURL) => {
    const browser = await getBrowser();
    const page = await browser.newPage();
    const deck = await getDeckWithLevel(deckURL, page);
    const userDecks = await getFileDecks();
    if (!userDecks[name])
        return 'Deck not found with that name';
    userDecks[name] = deck;
    browser.close();
    await saveToFile(userDecks);
    return `Deck updated: ${name}`;
}

const searchDecks = async (numPages, filters) => {
    let decks = [];
    if (filters.level) {
        decks.push(...await getDecksByLevel(numPages, filters.level));
    } else {
        decks.push(...await getDecksByLevel(numPages, 0));
    }
    
    if (filters.commander) {
        decks = decks.filter(deck => 
            deck.commander.toLowerCase().includes(filters.commander.toLowerCase())
        );
    }

    if (filters.type) {
        decks = decks.filter(deck => 
            deck.type.toLowerCase().includes(filters.type.toLowerCase())
        );
    }

    return decks;
}

export { getRandomDeck, getDeckWithLevel, getDecksByLevel, getSavedDeck, getSavedDecks, deleteSavedDeck, updateSavedDeck, saveDeck, getRandomDeckByLevel, searchDecks };