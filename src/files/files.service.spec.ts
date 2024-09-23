import { Test, TestingModule } from '@nestjs/testing';
import { FilesService } from './files.service';
import { DatabaseService } from '../database/database.service';
import { S3Service } from '../s3/s3.service';

describe('FilesService', () => {
  let service: FilesService;

  const mockDatabaseService = {
    file: {
      create: jest.fn(),
      findMany: jest.fn(),
      findUnique: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
  };

  const mockS3Service = {
    uploadFile: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        FilesService,
        {
          provide: DatabaseService,
          useValue: mockDatabaseService,
        },
        {
          provide: S3Service,
          useValue: mockS3Service,
        },
      ],
    }).compile();

    service = module.get<FilesService>(FilesService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
