import { DataSource } from "typeorm";
import { LocalDeck } from "./entity/localdeck.js";
import { Grades } from "./entity/grades.js";

export const AppDataSource = new DataSource({
    type: "sqlite",
    database: "data/data.sqlite",
    synchronize: true,
    logging: false,
    entities: [LocalDeck, Grades],
    subscribers: [],
    migrations: [],
})