import { Test, TestingModule } from '@nestjs/testing';
import { UsersService } from './users.service';
import { DatabaseService } from '../database/database.service';
import { NotFoundException, ForbiddenException } from '@nestjs/common';
import { User, Address } from '@prisma/client';
import { UpdateUserDto } from './dto/update-user.dto';
import { CreateAddressDto } from './dto/create-address.dto';
import { UpdateAddressDto } from './dto/update-address.dto';
import * as bcrypt from 'bcryptjs';

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

  describe('updateUserById', () => {
    it('should update a user', async () => {
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

      const updateUserDto: UpdateUserDto = {
        firstName: 'John_updated',
        lastName: 'Doe_updated',
        email: `johnDoe_updated@example.com`,
        phone: '1234567890_updated',
      };

      mockDatabaseService.user.findUnique.mockResolvedValue(mockUser);
      mockDatabaseService.user.update.mockResolvedValue(mockUser);

      const result = await service.updateUserById('1', updateUserDto, mockUser);

      expect(result).toEqual({ ...mockUser, password: undefined });
      expect(mockDatabaseService.user.findUnique).toHaveBeenCalledWith({
        where: { id: '1' },
      });
      expect(mockDatabaseService.user.update).toHaveBeenCalledWith({
        where: { id: '1' },
        data: updateUserDto,
      });
    });

    it('should throw NotFoundException if user not found', async () => {
      mockDatabaseService.user.findUnique.mockResolvedValue(null);

      await expect(
        service.updateUserById('1', {} as UpdateUserDto, { id: '1', role: 'USER' } as User),
      ).rejects.toThrow(NotFoundException);
    });

    it('should throw ForbiddenException if non-admin user tries to update another user', async () => {
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

      const updateUserDto: UpdateUserDto = {
        firstName: 'John_updated',
        lastName: 'Doe_updated',
        email: `johnDoe_updated@example.com`,
        phone: '1234567890_updated',
      };

      const anotherUser: User = {
        id: '2',
        role: 'USER',
        firstName: 'Jane',
        lastName: 'Doe',
        email: `janeDoe@example.com`,
        password: 'hashedpassword',
        phone: '0987654321',
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockDatabaseService.user.findUnique.mockResolvedValue(anotherUser);

      await expect(
        service.updateUserById('2', updateUserDto, mockUser),
      ).rejects.toThrow(ForbiddenException);
    });
  });

  describe('deleteUserById', () => {
    it('should delete a user', async () => {
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
      mockDatabaseService.user.delete.mockResolvedValue(undefined);

      await service.deleteUserById('1', mockUser);

      expect(mockDatabaseService.user.findUnique).toHaveBeenCalledWith({
        where: { id: '1' },
      });
      expect(mockDatabaseService.user.delete).toHaveBeenCalledWith({
        where: { id: '1' },
      });
    });

    it('should throw NotFoundException if user not found', async () => {
      mockDatabaseService.user.findUnique.mockResolvedValue(null);

      await expect(
        service.deleteUserById('1', { id: '1', role: 'USER' } as User),
      ).rejects.toThrow(NotFoundException);
    });

    it('should throw ForbiddenException if non-admin user tries to delete another user', async () => {
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
    
      const anotherUser: User = {
        id: '2',
        role: 'USER',
        firstName: 'Jane',
        lastName: 'Doe',
        email: `janeDoe@example.com`,
        password: 'hashedpassword',
        phone: '0987654321',
        createdAt: new Date(),
        updatedAt: new Date(),
      };
    
      mockDatabaseService.user.findUnique.mockResolvedValue(anotherUser);
    
      await expect(
        service.deleteUserById('2', mockUser),
      ).rejects.toThrow(ForbiddenException);
    });
  });

  describe('insertAddress', () => {
    it('should insert an address', async () => {
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

      const createAddressDto: CreateAddressDto = {
        userId: '1',
        reciverName: 'John Doe',
        phone: '1234567890',
        address: '123 Main St, Anytown, USA',
        subDistrict: 'Anytown',
        district: 'Anytown',
        province: 'Anytown',
        country: 'USA',
        postalCode: '12345',
        taxPayerName: 'John Doe',
        taxPayerId: '1234567890',
      };

      const mockAddress: Address = {
        id: '1',
        userId: '1',
        reciverName: 'John Doe',
        phone: '1234567890',
        address: '123 Main St, Anytown, USA',
        subDistrict: 'Anytown',
        district: 'Anytown',
        province: 'Anytown',
        country: 'USA',
        postalCode: '12345',
        taxPayerName: 'John Doe',
        taxPayerId: '1234567890',
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockDatabaseService.address.create.mockResolvedValue(mockAddress);

      const result = await service.insertAddress(createAddressDto, mockUser);

      expect(result).toEqual(mockAddress);
      expect(mockDatabaseService.address.create).toHaveBeenCalledWith({
        data: { ...createAddressDto, userId: mockUser.id },
      });
    });

    it('should throw ForbiddenException if user already has an address', async () => {
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

      const createAddressDto: CreateAddressDto = {
        userId: '1',
        reciverName: 'John Doe',
        phone: '1234567890',
        address: '123 Main St, Anytown, USA',
        subDistrict: 'Anytown',
        district: 'Anytown',
        province: 'Anytown',
        country: 'USA',
        postalCode: '12345',
        taxPayerName: 'John Doe',
        taxPayerId: '1234567890',
      };

      mockDatabaseService.address.create.mockRejectedValue({
        code: 'P2002',
        meta: { target: ['userId'] },
      });

      await expect(
        service.insertAddress(createAddressDto, mockUser),
      ).rejects.toThrow(ForbiddenException);
    });
  });

  describe('findAddressByUserId', () => {
    it('should return an address by user ID', async () => {
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

      const mockAddress: Address = {
        id: '1',
        userId: '1',
        reciverName: 'John Doe',
        phone: '1234567890',
        address: '123 Main St, Anytown, USA',
        subDistrict: 'Anytown',
        district: 'Anytown',
        province: 'Anytown',
        country: 'USA',
        postalCode: '12345',
        taxPayerName: 'John Doe',
        taxPayerId: '1234567890',
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockDatabaseService.address.findUnique.mockResolvedValue(mockAddress);

      const result = await service.findAddressByUserId('1', mockUser);

      expect(result).toEqual(mockAddress);
      expect(mockDatabaseService.address.findUnique).toHaveBeenCalledWith({
        where: { userId: '1' },
      });
    });

    it('should throw NotFoundException if address not found', async () => {
      mockDatabaseService.address.findUnique.mockResolvedValue(null);

      await expect(
        service.findAddressByUserId('1', { id: '1', role: 'USER' } as User),
      ).rejects.toThrow(NotFoundException);
    });

    it('should throw ForbiddenException if non-admin user tries to access another user address', async () => {
      await expect(
        service.findAddressByUserId('2', { id: '1', role: 'USER' } as User),
      ).rejects.toThrow(ForbiddenException);
    });
  });

  describe('updateAddressByUserId', () => {
    it('should update an address by user ID', async () => {
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

      const updateAddressDto: UpdateAddressDto = {
        reciverName: 'John Doe Updated',
        phone: '1234567890_updated',
        address: '123 Main St, Anytown, USA_updated',
        subDistrict: 'Anytown_updated',
        district: 'Anytown_updated',
        province: 'Anytown_updated',
        country: 'USA_updated',
        postalCode: '12345_updated',
        taxPayerName: 'John Doe Updated',
        taxPayerId: '1234567890_updated',
      };

      const mockAddress: Address = {
        id: '1',
        userId: '1',
        reciverName: 'John Doe Updated',
        phone: '1234567890_updated',
        address: '123 Main St, Anytown, USA_updated',
        subDistrict: 'Anytown_updated',
        district: 'Anytown_updated',
        province: 'Anytown_updated',
        country: 'USA_updated',
        postalCode: '12345_updated',
        taxPayerName: 'John Doe Updated',
        taxPayerId: '1234567890_updated',
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockDatabaseService.address.findUnique.mockResolvedValue(mockAddress);
      mockDatabaseService.address.update.mockResolvedValue(mockAddress);

      const result = await service.updateAddressByUserId(
        '1',
        updateAddressDto,
        mockUser,
      );

      expect(result).toEqual(mockAddress);
      expect(mockDatabaseService.address.findUnique).toHaveBeenCalledWith({
        where: { userId: '1' },
      });
      expect(mockDatabaseService.address.update).toHaveBeenCalledWith({
        where: { userId: '1' },
        data: updateAddressDto,
      });
    });

    it('should throw NotFoundException if address not found', async () => {
      mockDatabaseService.address.findUnique.mockResolvedValue(null);

      await expect(
        service.updateAddressByUserId(
          '1',
          {} as UpdateAddressDto,
          { id: '1', role: 'USER' } as User,
        ),
      ).rejects.toThrow(NotFoundException);
    });

    it('should throw ForbiddenException if non-admin user tries to update another user address', async () => {
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

      const updateAddressDto: UpdateAddressDto = {
        reciverName: 'John Doe Updated',
      };

      mockDatabaseService.address.findUnique.mockResolvedValue(mockUser);

      await expect(
        service.updateAddressByUserId(
          '2',
          updateAddressDto,
          { id: '1', role: 'USER' } as User,
        ),
      ).rejects.toThrow(ForbiddenException);
    });
  });

  describe('deleteAddressByUserId', () => {
    it('should delete an address by user ID', async () => {
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

      const mockAddress: Address = {
        id: '1',
        userId: '1',
        reciverName: 'John Doe',
        phone: '1234567890',
        address: '123 Main St, Anytown, USA',
        subDistrict: 'Anytown',
        district: 'Anytown',
        province: 'Anytown',
        country: 'USA',
        postalCode: '12345',
        taxPayerName: 'John Doe',
        taxPayerId: '1234567890',
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockDatabaseService.address.findUnique.mockResolvedValue(mockAddress);
      mockDatabaseService.address.delete.mockResolvedValue(undefined);

      await service.deleteAddressByUserId('1', mockUser);

      expect(mockDatabaseService.address.findUnique).toHaveBeenCalledWith({
        where: { userId: '1' },
      });
      expect(mockDatabaseService.address.delete).toHaveBeenCalledWith({
        where: { userId: '1' },
      });
    });

    it('should throw NotFoundException if address not found', async () => {
      mockDatabaseService.address.findUnique.mockResolvedValue(null);

      await expect(
        service.deleteAddressByUserId('1', { id: '1', role: 'USER' } as User),
      ).rejects.toThrow(NotFoundException);
    });

    it('should throw ForbiddenException if non-admin user tries to delete another user address', async () => {
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

      const mockAddress: Address = {
        id: '1',
        userId: '1',
        reciverName: 'John Doe',
        phone: '1234567890',
        address: '123 Main St, Anytown, USA',
        subDistrict: 'Anytown',
        district: 'Anytown',
        province: 'Anytown',
        country: 'USA',
        postalCode: '12345',
        taxPayerName: 'John Doe',
        taxPayerId: '1234567890',
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockDatabaseService.address.findUnique.mockResolvedValue(mockAddress);

      await expect(
        service.deleteAddressByUserId('2', { id: '1', role: 'USER' } as User),
      ).rejects.toThrow(ForbiddenException);
    });
  });
});
  