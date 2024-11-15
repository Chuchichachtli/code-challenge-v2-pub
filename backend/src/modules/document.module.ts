import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Folder } from 'src/entities/folder';
import { DocumentService } from 'src/services/documents.service';
import { DocumentsController } from 'src/controllers/documents.controller';
import { FolderService } from 'src/services/folder.service';
import { S3Service } from 'src/services/s3.service';
import { AppDocument } from 'src/entities/document';

@Module({
  imports: [TypeOrmModule.forFeature([AppDocument, Folder])],
  providers: [DocumentService, FolderService, S3Service],
  controllers: [DocumentsController],
  exports: [DocumentService],
})
export class DocumentModule {}
