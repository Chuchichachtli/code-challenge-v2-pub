import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Folder } from './folder';

@Entity()
export class AppDocument {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @ManyToOne(() => Folder, (folder) => folder.documents, {
    onDelete: 'CASCADE',
  })
  @JoinColumn()
  folder: Folder;

  @Column()
  path: string;
}
