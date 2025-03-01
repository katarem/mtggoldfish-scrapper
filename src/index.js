#!/usr/bin/env node

import { getRandomDeck } from "./functions.js";

try {
    const pages = process.argv[2] ? Number.parseInt(process.argv[2]) : 1;

    if (isNaN(pages) || pages <= 0) {
        throw new Error('Invalid number of pages. Please provide a positive integer.');
    }

    const randomDeck = await getRandomDeck(pages);

    console.log('Chosen deck:', randomDeck);
} catch (e) {
    console.error('Could not get a random deck:', e);
    process.exit(1);
}
