import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";

@Entity()
export class Grades {
    @PrimaryGeneratedColumn()
    id!: number;
    @Column()
    saltiness!: string;
    @Column()
    interaction!: string;
    @Column()
    wincons!: string;
    @Column()
    synergy!: string;
}