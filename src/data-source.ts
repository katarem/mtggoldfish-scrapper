import { DataSource } from "typeorm";
import { LocalDeck } from "./entity/localdeck.js";
import { Grades } from "./entity/grades.js";
import { directoryPath } from "./utils/path.js";

export const AppDataSource = new DataSource({
    type: "sqlite",
    database: directoryPath + "/data.sqlite",
    synchronize: true,
    logging: false,
    entities: [LocalDeck, Grades],
    subscribers: [],
    migrations: [],
})