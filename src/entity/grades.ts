import { Column, Entity } from "typeorm";

@Entity()
export class Grades {
    @Column()
    saltiness!: string;
    @Column()
    interaction!: string;
    @Column()
    wincons!: string;
    @Column()
    synergy!: string;
}