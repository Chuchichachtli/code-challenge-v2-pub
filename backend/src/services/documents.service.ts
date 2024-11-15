import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { AppDocument } from 'src/entities/document';
import { Repository } from 'typeorm';

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

  async updateName(id: string, name: string): Promise<AppDocument> {
    return (await this.repository.update(id, { id, name })).raw;
  }

  async delete(id: string): Promise<void> {
    await this.repository.delete(id);
  }
}
