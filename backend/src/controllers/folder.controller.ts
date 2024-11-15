import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
} from '@nestjs/common';
import { FolderService } from 'src/services/folder.service';
import { Folder } from 'src/entities/folder';
import { AppDocument } from 'src/entities/document';
import { S3Service } from 'src/services/s3.service';

@Controller('/api/v2/folders')
export class FoldersController {
  constructor(
    private readonly service: FolderService,
    private readonly s3Service: S3Service,
  ) {}

  @Get('/all')
  getAllInList(): Promise<Folder[]> {
    return this.service.findAll();
  }
  @Get()
  getAll(): Promise<Folder> {
    return this.service.getRootWithDescendants();
  }

  @Get('/:id')
  getById(@Param('id') id: string): Promise<Folder> {
    return this.service.findOne(id);
  }

  @Post('/root')
  async createRoot(): Promise<Folder> {
    const data = new Folder();
    data.documents = [];
    data.parentFolder = null;
    data.name = 'Root';
    return await this.service.create(data);
  }

  @Post()
  async create(@Body('parentId') parentId): Promise<Folder> {
    let defaultFolderName = 'New Folder';
    const targetFolder = await this.service.findOne(parentId);
    if (!targetFolder) {
      throw new Error('Parent folder not found');
    }

    const data = new Folder();
    data.documents = [];
    data.parentFolder = targetFolder ?? undefined;
    data.name = defaultFolderName;
    return await this.service.create(data);
  }

  @Delete('/:id')
  async delete(@Param('id') id: string): Promise<void> {
    await this.service.findOne(id).then((folder) => {
      this.service.findPath(folder).then((path) => {
        // I hadn't worked with S3 Client before and apparently can't delete a folder directly.
      });
    });
    await this.service.remove(id);
  }

  @Patch('/:id')
  async update(
    @Body('name') name: string,
    @Param('id') id: string,
  ): Promise<Folder> {
    const folder = await this.service.findOne(id);
    if (!folder) {
      throw new Error('Folder not found');
    }
    folder.name = name;
    // Didn't have the time to update the S3 folders. -- So all document and folder paths.
    return await this.service.update(folder);
  }
}
