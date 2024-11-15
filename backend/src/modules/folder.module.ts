import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Folder } from 'src/entities/folder';
import { FolderService } from 'src/services/folder.service';
import { FoldersController } from 'src/controllers/folder.controller';
import { DocumentService } from 'src/services/documents.service';
import { S3Service } from 'src/services/s3.service';
import { AppDocument } from 'src/entities/document';

@Module({
  imports: [TypeOrmModule.forFeature([AppDocument, Folder])],
  providers: [DocumentService, FolderService, S3Service],
  controllers: [FoldersController],
  exports: [FolderService],
})
export class FolderModule {}
