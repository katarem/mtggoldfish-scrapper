import fs from 'fs';
import path from 'path';
import * as url from 'url';

const paths = {
    userDecks: path.join(url.fileURLToPath(new URL('.', import.meta.url)), '..', 'data/user_decks.json'),
}

const saveToFile = async (decks) => {
    const dir = path.dirname(paths.userDecks);
    if (!fs.existsSync(dir)) {
        await fs.promises.mkdir(dir, { recursive: true });
    }
    await fs.promises.writeFile(paths.userDecks, JSON.stringify(decks, null, 2), { encoding: 'utf8'});
}

const getFileDecks = async () => {
    const data = fs.existsSync(paths.userDecks)
        ? await fs.promises.readFile(paths.userDecks, { encoding: 'utf8' })
        : '{}';
    return JSON.parse(data);
};

export { saveToFile, getFileDecks };