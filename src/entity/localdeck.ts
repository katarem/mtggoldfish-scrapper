import { Column, Entity, JoinColumn, OneToOne, PrimaryGeneratedColumn } from "typeorm";
import { Grades } from "./grades.js";

@Entity()
export class LocalDeck {
    @Column()
    id!: string;
    @Column()
    name!: string;
    @Column()
    link!: string;
    @Column()
    commander!: string;
    @Column()
    user!: string;
    @Column()
    level!: number;
    @Column()
    type!: string;

    @OneToOne(() => Grades)
    @JoinColumn()
    grades!: Grades;
}