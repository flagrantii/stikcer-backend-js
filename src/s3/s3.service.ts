import {
  Injectable,
  Logger,
  InternalServerErrorException,
} from '@nestjs/common';
import {
  S3Client,
  PutObjectCommand,
  DeleteObjectCommand,
  GetObjectCommand,
} from '@aws-sdk/client-s3';
import { ConfigService } from '@nestjs/config';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import * as uuid from 'uuid';

@Injectable()
export class S3Service {
  private readonly s3Client: S3Client;
  private readonly logger = new Logger(S3Service.name);

  constructor(private configService: ConfigService) {
    this.s3Client = new S3Client({
      region: this.configService.get<string>('AWS_REGION'),
      credentials: {
        accessKeyId: this.configService.get<string>('AWS_ACCESS_KEY_ID'),
        secretAccessKey: this.configService.get<string>(
          'AWS_SECRET_ACCESS_KEY',
        ),
      },
    });
  }

  private generateFileKey(originalName: string): string {
    return `${Date.now()}-${uuid.v4()}-${originalName}`;
  }

  async uploadFile(
    file: Express.Multer.File,
  ): Promise<{ error: string; key: string; size: number; type: string; displayName: string }> {
    try {
      const key = this.generateFileKey(file.originalname);
      const command = new PutObjectCommand({
        Bucket: this.configService.get<string>('AWS_BUCKET_NAME'),
        Key: key,
        Body: file.buffer,
        ContentType: file.mimetype,
      });
      const result = await this.s3Client.send(command);
      this.logger.log(`File uploaded: ${key}`, result);
      return {
        error: null,
        displayName: file.originalname,
        key: key,
        size: file.size,
        type: file.mimetype,
      };
    } catch (error) {
      this.logger.error(`Failed to upload file: ${error.message}`, error.stack);
      throw new InternalServerErrorException('Failed to upload file');
    }
  }

  async deleteFile(key: string): Promise<{ error: string }> {
    try {
      const command = new DeleteObjectCommand({
        Bucket: this.configService.get<string>('AWS_BUCKET_NAME'),
        Key: key,
      });
      await this.s3Client.send(command);
      return { error: null };
    } catch (error) {
      this.logger.error(`Failed to delete file: ${error.message}`, error.stack);
      return { error: 'File deletion failed' };
    }
  }

  async getFile(key: string): Promise<{ error: string; file: string | null }> {
    try {
      const command = new GetObjectCommand({
        Bucket: this.configService.get<string>('AWS_BUCKET_NAME'),
        Key: key,
      });
      const response = await this.s3Client.send(command);
      const file = await response.Body?.transformToString();
      return { error: null, file: file };
    } catch (error) {
      this.logger.error(`Failed to get file: ${error.message}`, error.stack);
      return { error: 'File retrieval failed', file: null };
    }
  }

  async getPresignedUrl(
    key: string,
  ): Promise<{ error: string; url: string | null }> {
    try {
      const command = new GetObjectCommand({
        Bucket: this.configService.get<string>('AWS_BUCKET_NAME'),
        Key: key,
      });
      const url = await getSignedUrl(this.s3Client, command, {
        expiresIn: 3600,
      });
      return { error: null, url: url };
    } catch (error) {
      this.logger.error(
        `Failed to get file url: ${error.message}`,
        error.stack,
      );
      return { error: 'File url retrieval failed', url: null };
    }
  }
}
