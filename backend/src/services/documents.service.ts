import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { AppDocument } from 'src/entities/document';
import { In, Repository } from 'typeorm';

@Injectable()
export class DocumentService {
  constructor(
    @InjectRepository(AppDocument)
    private repository: Repository<AppDocument>,
  ) {}

  findAll(): Promise<AppDocument[]> {
    return this.repository.find();
  }

  findOne(id: string): Promise<AppDocument | null> {
    return this.repository.findOne({
      where: { id: id },
      relations: ['folder'],
    });
  }

  async create(data: AppDocument): Promise<AppDocument> {
    return await this.repository.save(data);
  }

  async update(id: string, name: string, path: string): Promise<AppDocument> {
    return (await this.repository.update(id, { id, name, path })).raw;
  }

  async delete(id: string): Promise<void> {
    await this.repository.delete(id);
  }

  async deleteByIds(idsToDelete: Array<string>): Promise<void> {
    if (idsToDelete.length === 0) {
      return Promise.resolve();
    }
    await this.repository.delete(idsToDelete);
  }

  async getInFolders(
    folderIdsToDelete: Array<string>,
  ): Promise<Array<AppDocument>> {
    if (folderIdsToDelete.length === 0) {
      return Promise.resolve([]);
    }
    return await this.repository.find({
      where: { folder: In(folderIdsToDelete) },
    });
  }
}
