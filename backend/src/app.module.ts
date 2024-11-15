import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Folder } from './entities/folder';
import { FolderModule } from './modules/folder.module';
import { AppDocument } from './entities/document';
import { DocumentModule } from './modules/document.module';

@Module({
  imports: [
    ConfigModule.forRoot(),
    TypeOrmModule.forRoot({
      type: 'postgres',
      url: process.env.DATABASE_URL,
      password: process.env.POSTGRES_PASSWORD,
      username: process.env.POSTGRES_USER,
      entities: [Folder, AppDocument],
      synchronize: true,
      logging: true,
    }),
    FolderModule,
    DocumentModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
