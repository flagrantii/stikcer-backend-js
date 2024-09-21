import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { S3Service } from './s3.service';
import { S3 } from '@aws-sdk/client-s3';

@Module({
  imports: [ConfigModule],
  providers: [
    S3Service,
    {
      provide: 'S3',
      useFactory: (configService: ConfigService) => {
        return new S3({
          credentials: {
            accessKeyId: configService.get('AWS_ACCESS_KEY_ID'),
            secretAccessKey: configService.get('AWS_SECRET_ACCESS_KEY'),
          },
          region: configService.get('AWS_REGION'),
        });
      },
      inject: [ConfigService],
    },
  ],
  exports: [S3Service],
})
export class S3Module {}
