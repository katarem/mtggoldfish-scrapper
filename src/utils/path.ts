import * as url from "url";

const dataPath = new URL("../../data", import.meta.url);
const directoryPath = url.fileURLToPath(dataPath);

export { directoryPath };