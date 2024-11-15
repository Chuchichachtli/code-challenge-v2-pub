import {
  Body,
  Controller,
  Delete,
  Get,
  NotFoundException,
  Param,
  Patch,
  Post,
  Res,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { Response } from 'express';
import * as stream from 'stream';
import { DocumentService } from 'src/services/documents.service';
import { AppDocument } from 'src/entities/document';
import { FolderService } from 'src/services/folder.service';
import { S3Service } from 'src/services/s3.service';

@Controller('/api/v2/documents')
export class DocumentsController {
  constructor(
    private readonly service: DocumentService,
    private readonly folderService: FolderService,
    private readonly s3Service: S3Service,
  ) {}

  @Post()
  @UseInterceptors(FileInterceptor('data'))
  uploadFile(@Body() parentId, @UploadedFile() data: Express.Multer.File) {
    this.folderService.findOne(parentId['parentId']).then((folder) => {
      if (!folder) {
        throw new NotFoundException(`Folder with ID ${parentId} not found`);
      }

      this.folderService
        .findPath(folder)
        .then((path) => {
          this.s3Service.uploadFile(data, path);
        })
        .then(() => {
          const newDocument = new AppDocument();
          newDocument.folder = folder;
          newDocument.name = data.originalname;
          this.service.create(newDocument);
        });
    });
  }

  @Get('/:id')
  async getFile(@Param('id') id: string, @Res() res: Response) {
    const doc = await this.service.findOne(id);

    if (!doc) {
      throw new NotFoundException(`Document with ID ${id} not found`);
    }

    let path = await this.folderService.findPath(doc.folder);

    const file = await this.s3Service.getFile(path + '/' + doc.name);

    if (!file || !file.Body) {
      throw new NotFoundException(`File not found in S3`);
    }
    res.setHeader('Content-Type', file.ContentType);
    res.setHeader('Content-Disposition', `attachment; filename="${doc.name}"`);

    const buffer = await file.Body.transformToByteArray();
    const readableStream = stream.Readable.from(buffer);
    readableStream.pipe(res).send(buffer);
  }

  @Delete('/:id')
  deleteFile(@Param('id') id: string) {
    this.service.findOne(id).then((doc) => {
      if (!doc) {
        throw new NotFoundException(`Document with ID ${id} not found`);
      }
      this.folderService.findPath(doc.folder).then((path) => {
        this.s3Service.deleteFile(path + '/' + doc.name);
      });
    });

    return this.s3Service.deleteFile(id).then(() => {
      return this.service.delete(id);
    });
  }

  @Patch('/:id')
  updateFileName(@Body() name, @Param('id') id: string) {
    this.service.findOne(id).then((doc) => {
      if (!doc) {
        throw new NotFoundException(`Document with ID ${id} not found`);
      }

      this.folderService.findPath(doc.folder).then((path) => {
        this.s3Service
          .updateFileName(path + '/' + doc.name, path + '/' + name['name'])
          .then(() => {
            return this.service.updateName(id, name['name']);
          });
      });
    });

    return this.service.updateName(id, name['name']);
  }
}
