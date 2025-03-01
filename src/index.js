import { getRandomDeck } from "./functions.js";

const randomDeck = await getRandomDeck(5);

console.log('Deck elegido:',randomDeck);
