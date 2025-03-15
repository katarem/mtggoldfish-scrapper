import CardWebsite from "./cardwebsite"

type SearchOptions = {
    type: string | null,
    commander: string | null,
    level: number,
    pages: number | null,
    web: CardWebsite | undefined
}

export default SearchOptions;