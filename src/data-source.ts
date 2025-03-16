import { DataSource } from "typeorm";
import { LocalDeck } from "./entity/localdeck.js";
import { Grades } from "./entity/grades.js";

export const AppDataSource = new DataSource({
    type: "sqlite",
    database: "data",
    synchronize: true,
    logging: true,
    entities: [LocalDeck, Grades],
    subscribers: [],
    migrations: [],
})