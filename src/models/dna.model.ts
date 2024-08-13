import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity('Dna', { schema: 'Qrvey' })
export class DnaModel {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column('simple-array')
  sequence!: string[];

  @Column()
  isSpecial!: boolean;

  @Column('datetime', { name: 'createdAt' })
  createdAt!: Date;

  @Column('datetime', { name: 'updatedAt' })
  updatedAt!: Date;
}
