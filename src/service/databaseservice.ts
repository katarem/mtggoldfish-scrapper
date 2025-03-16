import { Repository } from "typeorm";
import { AppDataSource } from "../data-source.js";
import { LocalDeck } from "../entity/localdeck.js";

export class DatabaseService {

    private static instance: DatabaseService;
    private localDeckRepository: Repository<LocalDeck> | null = null;

    static async getInstance(): Promise<DatabaseService> {
        if (!AppDataSource.isInitialized)
            await AppDataSource.initialize();
        if (!DatabaseService.instance) {
            DatabaseService.instance = new DatabaseService();
            DatabaseService.instance.localDeckRepository = AppDataSource.getRepository(LocalDeck);
        }
        return DatabaseService.instance;
    }

    async close(): Promise<void> {
        await AppDataSource.destroy();
    }

    async getDeck(id: string): Promise<LocalDeck | null> {
        return await DatabaseService.instance.localDeckRepository?.findOneBy({ id }) ?? null;
    }

    async saveDeck(deck: LocalDeck): Promise<LocalDeck | null> {
        return await DatabaseService.instance.localDeckRepository?.save(deck) ?? null;
    }

    async updateDeck(id: string, deck: LocalDeck): Promise<boolean> {
        const updateResult = await DatabaseService.instance.localDeckRepository?.update(id, deck) ?? null;
        return updateResult ? true : false;
    }

    async deleteDeck(id: string): Promise<boolean> {
        const deleteResult = await DatabaseService.instance.localDeckRepository?.delete(id) ?? null;
        return deleteResult ? true : false;
    }

    async getAll(): Promise<LocalDeck[]> {
        return await DatabaseService.instance.localDeckRepository?.find() ?? [];
    }

}