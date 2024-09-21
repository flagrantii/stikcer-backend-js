import { Module } from '@nestjs/common';
import { FilesController } from './files.controller';
import { FilesService } from './files.service';
import { DatabaseModule } from '../database/database.module';
import { S3Module } from '../s3/s3.module';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [DatabaseModule, S3Module, ConfigModule],
  controllers: [FilesController],
  providers: [FilesService],
  exports: [FilesService],
})
export class FilesModule {}
