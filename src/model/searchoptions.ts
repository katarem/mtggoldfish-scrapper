import CardWebsite from "./cardwebsite.js"
import { PerformanceValue } from "./performance.js";

type SearchOptions = {
    type: string | null,
    commander: string | null,
    level: number,
    pages: number | null,
    web: CardWebsite | undefined,
    random: boolean,
    mode: PerformanceValue
}

export default SearchOptions;