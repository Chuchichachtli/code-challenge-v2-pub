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
import { S3Service } from 'src/services/s3.service';
import { DocumentService } from 'src/services/documents.service';

@Controller('/api/v2/folders')
export class FoldersController {
  constructor(
    private readonly service: FolderService,
    private readonly documentService: DocumentService,
    private readonly s3Service: S3Service,
  ) {}

  @Get('/all')
  getAllInList(): Promise<Folder[]> {
    return this.service.findAll();
  }
  @Get()
  getAll(): Promise<Folder> {
    const folder = this.service.getRootWithDescendants().then((folder) => {
      if (!folder) {
        const data = new Folder();
        data.documents = [];
        data.parentFolder = null;
        data.name = 'Root';
        return this.service.create(data);
      }
      return folder;
    });

    return folder;
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
    let folderSuffix = 1;
    let folderName = defaultFolderName;

    const folderNames =
      targetFolder?.children?.map((folder) => folder.name) ?? [];

    while (folderNames.includes(folderName)) {
      folderName = defaultFolderName + ' (' + folderSuffix + ')';
      folderSuffix++;
    }

    if (!targetFolder) {
      throw new Error('Parent folder not found');
    }

    const data = new Folder();
    data.documents = [];
    data.parentFolder = targetFolder ?? undefined;
    data.name = folderName;
    return await this.service.create(data);
  }

  @Delete('/:id')
  async delete(@Param('id') id: string): Promise<void> {
    await this.service.findOne(id).then((folder) => {
      if (!folder) {
        throw new Error('Folder not found');
      }
      this.service.getDocumentWithDescendants(folder).then((folder) => {
        let folderIdsToDelete: Array<string> = [];
        folderIdsToDelete = this.service.getChildrenFolderIdsFromTree(
          folder,
          folderIdsToDelete,
        );

        this.documentService.getInFolders(folderIdsToDelete).then((docs) => {
          docs.forEach((doc) => {
            this.s3Service.deleteFile(doc.path);
          });
          this.documentService.deleteByIds(docs.map((doc) => doc.id));

          this.service.deleteFolder(folder);
        });
      });
    });
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

    if (!folder) {
      throw new Error('Folder not found');
    }

    const updated = this.service.update(folder).then((updatedFolder) => {
      this.service.getDocumentWithDescendants(folder).then((folder) => {
        let foldersToUpdate: Array<Folder> = [];
        foldersToUpdate = this.service.getChildrenFoldersFromTree(
          folder,
          foldersToUpdate,
        );

        this.documentService
          .getInFolders(foldersToUpdate.map((folder) => folder.id))
          .then((docs) => {
            this.service.findPath(folder).then((currPath) => {
              docs.forEach((doc) => {
                const oldPath = doc.path;
                const newPath = currPath + '/' + doc.name;

                this.s3Service.updateFileName(oldPath, newPath);
                this.documentService.update(doc.id, doc.name, newPath);
              });
            });
          });
      });
      return updatedFolder;
    });
    return updated;
  }
}
