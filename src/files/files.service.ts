import {
  Injectable,
  Logger,
  NotFoundException,
  ForbiddenException,
  InternalServerErrorException,
} from '@nestjs/common';
import { DatabaseService } from '../database/database.service';
import { S3Service } from '../s3/s3.service';
import { File, User } from '@prisma/client';
import { CreateFileDto } from '../files/dto/create-file';
import { UpdateFileDto } from '../files/dto/update-file';
import * as uuid from 'uuid';

@Injectable()
export class FilesService {
  private readonly logger = new Logger(FilesService.name);

  constructor(
    private readonly databaseService: DatabaseService,
    private readonly s3Service: S3Service,
  ) {}

  async uploadFile(createFileDto: CreateFileDto, user: User): Promise<File> {
    this.logger.log(`Attempting to upload a new file for user: ${user.id}`);
    try {
      const { key, size, type, displayName } = await this.s3Service.uploadFile(
        createFileDto.file,
      );
      const fileId = uuid.v4();

      const createdFile = await this.databaseService.file.create({
        data: {
          id: fileId,
          userId: user.id,
          productId: createFileDto.productId,
          categoryId: createFileDto.categoryId,
          key: key,
          type: type,
          size: size,
          isPurchased: false,
          displayName: displayName,
        },
      });

      this.logger.log(`File uploaded successfully: ${createdFile.id}`);
      return createdFile;
    } catch (error) {
      this.logger.error(`Failed to upload file: ${error.message}`, error.stack);
      throw new InternalServerErrorException('Failed to upload file');
    }
  }

  async getFilesFromProductId(
    productId: string,
    user: User,
  ): Promise<Array<{ file: File; url: string }>> {
    this.logger.log(`Attempting to get files for product: ${productId}`);
    try {
      const files = await this.databaseService.file.findMany({
        where: { productId: productId },
      });

      if (files.length === 0) {
        throw new NotFoundException('Files not found');
      }

      const product = await this.databaseService.product.findUnique({
        where: { id: productId },
      });

      if (!product) {
        throw new NotFoundException('Product not found');
      }

      if (user.role !== 'ADMIN' && product.userId !== user.id) {
        throw new ForbiddenException(
          'You are not authorized to access these files',
        );
      }

      const filesWithUrls = await Promise.all(
        files.map(async (file) => {
          const { url } = await this.s3Service.getPresignedUrl(file.key);
          return { file, url };
        }),
      );

      return filesWithUrls;
    } catch (error) {
      this.logger.error(
        `Failed to get files for productId: ${productId}`,
        error.stack,
      );
      throw error;
    }
  }

  async getFilesFromUserIdandCategoryId(
    userId: string,
    categoryId: string,
    user: User,
  ): Promise<Array<{ file: File; url: string }>> {
    this.logger.log(`Attempting to get files for user: ${userId}`);
    try {
      const files = await this.databaseService.file.findMany({
        where: { userId: userId, categoryId: categoryId },
      });

      if (files.length === 0) {
        throw new NotFoundException('Files not found');
      }

      const category = await this.databaseService.productCategory.findUnique({
        where: { id: categoryId },
      });

      if (!category) {
        throw new NotFoundException('Category not found');
      }

      if (user.role !== 'ADMIN' && user.id !== userId) {
        throw new ForbiddenException(
          'You are not authorized to access these files',
        );
      }

      const filesWithUrls = await Promise.all(
        files.map(async (file) => {
          const { url } = await this.s3Service.getPresignedUrl(file.key);
          return { file, url };
        }),
      );

      return filesWithUrls;
    } catch (error) {
      this.logger.error(
        `Failed to get files for user: ${userId} and category: ${categoryId}`,
        error.stack,
      );
      throw error;
    }
  }

  async updateFile(
    id: string,
    updateFileDto: UpdateFileDto,
    user: User,
  ): Promise<File> {
    this.logger.log(`Attempting to update file with id: ${id}`);
    try {
      const existingFile = await this.databaseService.file.findUnique({
        where: { id },
      });

      if (!existingFile) {
        throw new NotFoundException('File not found');
      }

      if (user.role !== 'ADMIN' && existingFile.userId !== user.id) {
        throw new ForbiddenException(
          'You are not authorized to update this file',
        );
      }

      const updatedFile = await this.databaseService.file.update({
        where: { id },
        data: updateFileDto,
      });

      this.logger.log(`File updated successfully: ${updatedFile.id}`);
      return updatedFile;
    } catch (error) {
      this.logger.error(`Failed to update file: ${error.message}`, error.stack);
      throw error;
    }
  }

  async deleteFile(id: string, user: User): Promise<void> {
    this.logger.log(`Attempting to delete file with id: ${id}`);
    try {
      const existingFile = await this.databaseService.file.findUnique({
        where: { id },
      });

      if (!existingFile) {
        throw new NotFoundException('File not found');
      }

      if (user.role !== 'ADMIN' && existingFile.userId !== user.id) {
        throw new ForbiddenException(
          'You are not authorized to delete this file',
        );
      }

      await this.s3Service.deleteFile(existingFile.key);
      await this.databaseService.file.delete({ where: { id } });

      this.logger.log(`File deleted successfully: ${id}`);
    } catch (error) {
      this.logger.error(`Failed to delete file: ${error.message}`, error.stack);
      throw error;
    }
  }
}
