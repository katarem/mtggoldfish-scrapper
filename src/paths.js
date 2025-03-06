import path from 'path';
import * as url from 'url';
const paths = {
    userDecks: path.join(url.fileURLToPath(new URL('.', import.meta.url)), '..', 'data/user_decks.json'),
}