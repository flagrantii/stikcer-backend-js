import {
  Injectable,
  BadRequestException,
  InternalServerErrorException,
  NotFoundException,
  ForbiddenException,
  Logger,
} from '@nestjs/common';
import { DatabaseService } from 'src/database/database.service';
import { S3Service } from 'src/s3/s3.service';
import { CreateFileDto } from './dto/create-file';
import { User, File } from '@prisma/client';
import * as uuid from 'uuid';
import { UpdateFileDto } from './dto/update-file';
import { Cron, CronExpression } from '@nestjs/schedule';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class FilesService {
  private readonly logger = new Logger(FilesService.name);
  constructor(
    private readonly databaseService: DatabaseService,
    private readonly s3Service: S3Service,
    private readonly configService: ConfigService,
  ) {}

  private generateFileId(): number {
    return parseInt(uuid.v4().split('-').join(''), 16);
  }

  async uploadFile(
    createFileDto: CreateFileDto,
    file: Express.Multer.File,
    user: User,
  ): Promise<{ file: File; error: string }> {
    if (!file) {
      throw new BadRequestException('File is required');
    }

    try {
      const { key, size, type } = await this.s3Service.uploadFile(file);
      const fileId = this.generateFileId();

      return await this.databaseService.$transaction(async (prisma) => {
        const createdFile = await prisma.file.create({
          data: {
            id: fileId,
            userId: user.id,
            productId: createFileDto.productId,
            categoryId: createFileDto.categoryId,
            key: key,
            type: type,
            size: size,
            isPurchased: false,
          },
        });
        this.logger.log(`File uploaded successfully: ${createdFile.id}`);
        return { file: createdFile, error: null };
      });
    } catch (error) {
      this.logger.error(`Failed to upload file`, error.stack);
      throw new InternalServerErrorException('Failed to upload file');
    }
  }

  async getFilesFromProductId(productId: number): Promise<{
    files: Array<{ file: File; url: string | null }>;
    error: string;
  }> {
    try {
      const files = await this.databaseService.file.findMany({
        where: { productId: productId },
      });
      if (files.length === 0) {
        this.logger.error(`Files not found for productId: ${productId}`);
        throw new NotFoundException('Files not found');
      }

      const filesWithUrls = await Promise.all(
        files.map(async (file) => {
          const { error, url } = await this.s3Service.getPresignedUrl(file.key);
          if (error) {
            throw new InternalServerErrorException(
              'Failed to generate presigned URL',
            );
          }
          return { file, url };
        }),
      );

      return { files: filesWithUrls, error: null };
    } catch (error) {
      this.logger.error(
        `Failed to get files for productId: ${productId}`,
        error.stack,
      );
      throw new InternalServerErrorException('Failed to get files');
    }
  }

  async updateFile(
    id: number,
    updateFileDto: UpdateFileDto,
    user: User,
  ): Promise<{ file: File; error: string }> {
    try {
      const file = await this.databaseService.file.findUnique({
        where: { id },
      });
      if (!file) {
        this.logger.error(`File not found for id: ${id}`);
        throw new NotFoundException('File not found');
      }

      if (user.role === 'USER' && file.userId !== user.id) {
        this.logger.error(`Unauthorized access attempt for file id: ${id}`);
        throw new ForbiddenException(
          'You are not authorized to update this file',
        );
      }

      return await this.databaseService.$transaction(async (prisma) => {
        const updatedFile = await prisma.file.update({
          where: { id },
          data: updateFileDto,
        });
        this.logger.log(`File updated successfully: ${updatedFile.id}`);
        return { file: updatedFile, error: null };
      });
    } catch (error) {
      this.logger.error(`Failed to update file: ${id}`, error.stack);
      throw new InternalServerErrorException('Failed to update file');
    }
  }

  async deleteFile(
    id: number,
    user: User,
  ): Promise<{ file: File; error: string }> {
    try {
      const file = await this.databaseService.file.findUnique({
        where: { id },
      });
      if (!file) {
        this.logger.error(`File not found for id: ${id}`);
        throw new NotFoundException('File not found');
      }

      if (user.role === 'USER' && file.userId !== user.id) {
        this.logger.error(`Unauthorized access attempt for file id: ${id}`);
        throw new ForbiddenException(
          'You are not authorized to delete this file',
        );
      }

      //delete file from s3
      const { error } = await this.s3Service.deleteFile(file.key);
      if (error) {
        this.logger.error(`Failed to delete file from S3: ${error}`);
        throw new InternalServerErrorException('Failed to delete file from S3');
      }

      return await this.databaseService.$transaction(async (prisma) => {
        const deletedFile = await prisma.file.delete({
          where: { id },
        });
        this.logger.log(`File deleted successfully: ${deletedFile.id}`);
        return { file: deletedFile, error: null };
      });
    } catch (error) {
      this.logger.error(`Failed to delete file: ${id}`, error.stack);
      throw new InternalServerErrorException('Failed to delete file');
    }
  }

  @Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT)
  async cleanupUnpurchasedFiles(): Promise<void> {
    const fourteenDaysAgo = new Date(
      Date.now() -
        this.configService.get<number>('UNPURCHASED_FILE_RETENTION_PERIOD'),
    );

    const unpurchasedFiles = await this.databaseService.file.findMany({
      where: {
        isPurchased: false,
        createdAt: {
          lt: fourteenDaysAgo,
        },
      },
    });

    for (const file of unpurchasedFiles) {
      try {
        const { error } = await this.s3Service.deleteFile(file.key);
        if (error) {
          this.logger.error(
            `Failed to delete unpurchased file from S3: ${error}`,
          );
          throw new InternalServerErrorException(
            'Failed to delete unpurchased file from S3',
          );
        }
        const deletedFile = await this.databaseService.file.delete({
          where: { id: file.id },
        });
        this.logger.log(`Deleted unpurchased file: ${deletedFile.id}`);
      } catch (error) {
        this.logger.error(
          `Failed to delete unpurchased file: ${file.id}`,
          error.stack,
        );
      }
    }
  }
}
