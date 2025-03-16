import { Grades } from "../entity/grades.js";
import { LocalDeck } from "../entity/localdeck.js"
import { Deck } from "../model/deck.js"

function mapToEntity(deck: Deck, id: string): LocalDeck {
    const entity = new LocalDeck();
    entity.id = id;
    entity.link = deck.link;
    entity.commander = deck.commander;
    entity.user = deck.user;
    entity.level = deck.level;
    entity.type = deck.type;
    entity.grades = new Grades();
    entity.grades.saltiness = deck.grades.saltiness;
    entity.grades.interaction = deck.grades.interaction;
    entity.grades.wincons = deck.grades.wincons;
    entity.grades.synergy = deck.grades.synergy;
    return entity;
}

export { mapToEntity }