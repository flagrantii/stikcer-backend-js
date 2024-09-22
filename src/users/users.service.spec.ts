import { Test, TestingModule } from '@nestjs/testing';
import { UsersService } from './users.service';
import { DatabaseService } from '../database/database.service';
import { NotFoundException, ForbiddenException } from '@nestjs/common';
import { User } from '@prisma/client';

describe('UsersService', () => {
  let service: UsersService;

  const mockDatabaseService = {
    user: {
      findUnique: jest.fn(),
      findMany: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
    address: {
      findUnique: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        {
          provide: DatabaseService,
          useValue: mockDatabaseService,
        },
      ],
    }).compile();

    service = module.get<UsersService>(UsersService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('findUserProfile', () => {
    it('should return a user profile', async () => {
      const mockUser: User = {
        id: '1',
        role: 'USER',
        firstName: 'John',
        lastName: 'Doe',
        email: `johnDoe@example.com`,
        password: 'hashedpassword',
        phone: '1234567890',
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockDatabaseService.user.findUnique.mockResolvedValue(mockUser);

      const result = await service.findUserProfile('1', mockUser);

      expect(result).toEqual({ ...mockUser, password: undefined });
      expect(mockDatabaseService.user.findUnique).toHaveBeenCalledWith({
        where: { id: '1' },
      });
    });

    it('should throw NotFoundException if user not found', async () => {
      mockDatabaseService.user.findUnique.mockResolvedValue(null);

      await expect(
        service.findUserProfile('1', { id: '1', role: 'USER' } as User),
      ).rejects.toThrow(NotFoundException);
    });

    it("should throw ForbiddenException if non-admin user tries to access another user's profile", async () => {
      await expect(
        service.findUserProfile('2', { id: '1', role: 'USER' } as User),
      ).rejects.toThrow(ForbiddenException);
    });
  });

  describe('findAllUsers', () => {
    it('should return all users for admin', async () => {
      const mockUsers: User[] = [
        {
          id: '1',
          role: 'USER',
          firstName: 'John',
          lastName: 'Doe',
          email: `johnDoe@example.com`,
          password: 'hashedpassword',
          phone: '1234567890',
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          id: '2',
          role: 'USER',
          firstName: 'Jane',
          lastName: 'Doe',
          email: `janeDoe@example.com`,
          password: 'hashedpassword',
          phone: '0987654321',
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ];

      mockDatabaseService.user.findMany.mockResolvedValue(mockUsers);

      const result = await service.findAllUsers({ role: 'ADMIN' } as User);

      expect(result).toEqual(
        mockUsers.map((user) => ({ ...user, password: undefined })),
      );
      expect(mockDatabaseService.user.findMany).toHaveBeenCalled();
    });

    it('should throw ForbiddenException if non-admin user tries to access all users', async () => {
      await expect(
        service.findAllUsers({ role: 'USER' } as User),
      ).rejects.toThrow(ForbiddenException);
    });
  });

  // Add more test cases for other methods...
});
