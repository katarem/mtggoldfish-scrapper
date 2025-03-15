type Deck = {
    name: string | null;
    link: string;
    commander: string;
    user: string;
    level: number;
    type: string;
    grades: {
        saltiness: string;
        interaction: string;
        wincons: string;
        synergy: string;
    }
}