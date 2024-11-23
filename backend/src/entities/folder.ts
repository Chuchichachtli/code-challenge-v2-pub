import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  OneToMany,
  Tree,
  TreeChildren,
  TreeParent,
  JoinColumn,
} from 'typeorm';
import { AppDocument } from './document';

@Tree('closure-table')
@Entity()
export class Folder {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @TreeChildren()
  children: Folder[];

  @TreeParent({ onDelete: 'CASCADE' })
  @JoinColumn()
  parentFolder: Folder;

  @OneToMany(() => AppDocument, (doc) => doc.folder, {
    onDelete: 'CASCADE',
    eager: true,
  })
  documents: AppDocument[];
}
