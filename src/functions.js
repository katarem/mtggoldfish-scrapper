import puppeteer from 'puppeteer';

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
    const browser = await puppeteer.launch({ headless: true });

    const page = await browser.newPage();
    let decks = []
    for (let index = 1; index < numPages+1; index++) {
        const pageDecks = await getDecks(index, page);
        pageDecks.forEach(deck => decks.push(deck));
    }
    console.log('Obtained decks:',decks.length)
    const randomDeckNumber = Math.floor(Math.random() * decks.length);
    const randomDeck = decks[randomDeckNumber];
    browser.close();
    return randomDeck;
}

export { getRandomDeck };