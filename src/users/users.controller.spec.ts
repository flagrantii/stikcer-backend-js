import { Test, TestingModule } from '@nestjs/testing';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';
import { Address, User } from '@prisma/client';
import { UpdateUserDto } from './dto/update-user.dto';
import { ForbiddenException } from '@nestjs/common';
import { UpdateAddressDto } from './dto/update-address.dto';
import { CreateAddressDto } from './dto/create-address.dto';

describe('UsersController', () => {
  let controller: UsersController;

  const mockUsersService = {
    findUserProfile: jest.fn(),
    findAllUsers: jest.fn(),
    updateUserById: jest.fn(),
    deleteUserById: jest.fn(),
    findAddressByUserId: jest.fn(),
    insertAddress: jest.fn(),
    updateAddressByUserId: jest.fn(),
    deleteAddressByUserId: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UsersController],
      providers: [
        {
          provide: UsersService,
          useValue: mockUsersService,
        },
      ],
    }).compile();

    controller = module.get<UsersController>(UsersController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('getProfile', () => {
    it('should return the user profile', async () => {
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

      mockUsersService.findUserProfile.mockResolvedValue(mockUser);

      const result = await controller.getProfile({ user: mockUser });

      expect(result).toEqual(mockUser);
      expect(mockUsersService.findUserProfile).toHaveBeenCalledWith(
        mockUser.id,
        mockUser,
      );
    });
  });

  describe('getAddress', () => {
    it('should return the user address', async () => {
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

      mockUsersService.findAddressByUserId.mockResolvedValue(mockAddress);

      const result = await controller.getAddress({ user: mockUser });

      expect(result).toEqual(mockAddress);
      expect(mockUsersService.findAddressByUserId).toHaveBeenCalledWith(
        mockUser.id,
        mockUser,
      );
    });
  });

  describe('getAllUsers', () => {
    it('should return all users', async () => {
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

      mockUsersService.findAllUsers.mockResolvedValue(mockUsers);

      const result = await controller.getAllUsers({
        user: { role: 'ADMIN' } as User,
      });

      expect(result).toEqual(mockUsers);
      expect(mockUsersService.findAllUsers).toHaveBeenCalledWith({
        role: 'ADMIN',
      } as User);
    });

    it('should throw ForbiddenException if non-admin user tries to access all users', async () => {
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

      mockUsersService.findAllUsers.mockRejectedValue(new ForbiddenException());

      await expect(controller.getAllUsers({ user: mockUser })).rejects.toThrow(
        ForbiddenException,
      );
      expect(mockUsersService.findAllUsers).toHaveBeenCalledWith(mockUser);
    });
  });

  describe('updateUser', () => {
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

      mockUsersService.updateUserById.mockResolvedValue(mockUser);

      const result = await controller.updateUser(mockUser.id, updateUserDto, {
        user: mockUser,
      });

      expect(result).toEqual(mockUser);
      expect(mockUsersService.updateUserById).toHaveBeenCalledWith(
        mockUser.id,
        updateUserDto,
        mockUser,
      );
    });

    it('should throw ForbiddenException if non-admin user tries to update another user', async () => {
      const mockUser: User = {
        id: '1',
        role: 'USER',
        firstName: 'Jane',
        lastName: 'Doe',
        email: 'janeDoe@example.com',
        password: 'hashedpassword',
        phone: '1234567890',
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const updateUserDto: UpdateUserDto = {
        firstName: 'Jane',
      };

      mockUsersService.updateUserById.mockRejectedValue(
        new ForbiddenException(),
      );

      await expect(
        controller.updateUser('2', updateUserDto, { user: mockUser }),
      ).rejects.toThrow(ForbiddenException);
      expect(mockUsersService.updateUserById).toHaveBeenCalledWith(
        '2',
        updateUserDto,
        mockUser,
      );
    });
  });

  describe('deleteUser', () => {
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

      mockUsersService.deleteUserById.mockResolvedValue(undefined);

      await controller.deleteUser(mockUser.id, { user: mockUser });

      expect(mockUsersService.deleteUserById).toHaveBeenCalledWith(
        mockUser.id,
        mockUser,
      );
    });

    it('should throw ForbiddenException if non-admin user tries to delete another user', async () => {
      const mockUser: User = {
        id: '1',
        role: 'USER',
        firstName: 'John',
        lastName: 'Doe',
        email: 'johnDoe@example.com',
        password: 'hashedpassword',
        phone: '1234567890',
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockUsersService.deleteUserById.mockRejectedValue(
        new ForbiddenException(),
      );

      await expect(
        controller.deleteUser('2', { user: mockUser }),
      ).rejects.toThrow(ForbiddenException);
      expect(mockUsersService.deleteUserById).toHaveBeenCalledWith(
        '2',
        mockUser,
      );
    });
  });

  describe('getUserById', () => {
    it('should return a user by ID', async () => {
      const mockUser: User = {
        id: '1',
        role: 'USER',
        firstName: 'John',
        lastName: 'Doe',
        email: 'johnDoe@example.com',
        password: 'hashedpassword',
        phone: '1234567890',
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockUsersService.findUserProfile.mockResolvedValue(mockUser);

      const result = await controller.getUserById(mockUser.id, { user: mockUser });

      expect(result).toEqual(mockUser);
      expect(mockUsersService.findUserProfile).toHaveBeenCalledWith(
        mockUser.id,
        mockUser,
      );
    });

    it('should throw ForbiddenException if non-admin user tries to get another user', async () => {
      const mockUser: User = {
        id: '1',
        role: 'USER',
        firstName: 'John',
        lastName: 'Doe',
        email: 'johnDoe@example.com',
        password: 'hashedpassword',
        phone: '1234567890',
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockUsersService.findUserProfile.mockRejectedValue(
        new ForbiddenException(),
      );

      await expect(
        controller.getUserById('2', { user: mockUser }),
      ).rejects.toThrow(ForbiddenException);

      expect(mockUsersService.findUserProfile).toHaveBeenCalledWith(
        '2',
        mockUser,
      );
    });
  }); 
  
  describe('getUserAddressByUserId', () => {
    it('should return a user address by user ID', async () => {
      const mockUser: User = {
        id: '1',
        role: 'USER',
        firstName: 'John',
        lastName: 'Doe',
        email: 'johnDoe@example.com',
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

      mockUsersService.findAddressByUserId.mockResolvedValue(mockAddress);

      const result = await controller.getUserAddress(mockUser.id, { user: mockUser });

      expect(result).toEqual(mockAddress);
      expect(mockUsersService.findAddressByUserId).toHaveBeenCalledWith(
        mockUser.id,
        mockUser,
      );
    });

    it('should throw ForbiddenException if non-admin user tries to get another user address', async () => {
      const mockUser: User = {
        id: '1',
        role: 'USER',
        firstName: 'John',
        lastName: 'Doe',
        email: 'johnDoe@example.com',
        password: 'hashedpassword',
        phone: '1234567890',
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockUsersService.findAddressByUserId.mockRejectedValue(
        new ForbiddenException(),
      );

      await expect(
        controller.getUserAddress('2', { user: mockUser }),
      ).rejects.toThrow(ForbiddenException);

      expect(mockUsersService.findAddressByUserId).toHaveBeenCalledWith(
        '2',
        mockUser,
      );
    });
  });

  describe('createUserAddress', () => {
    it('should create a user address', async () => {
      const mockUser: User = {
        id: '1',
        role: 'USER',
        firstName: 'John',
        lastName: 'Doe',
        email: 'johnDoe@example.com',
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

      mockUsersService.insertAddress.mockResolvedValue(mockAddress);

      const result = await controller.createUserAddress(
        mockUser.id,
        createAddressDto,
        { user: mockUser },
      );

      expect(result).toEqual(mockAddress);
      expect(mockUsersService.insertAddress).toHaveBeenCalledWith(
        createAddressDto,
        mockUser,
      );
    });
  });

  describe('updateUserAddressByUserId', () => {
    it('should update a user address by user ID', async () => {
      const mockUser: User = {
        id: '1',
        role: 'USER',
        firstName: 'John',
        lastName: 'Doe',
        email: 'johnDoe@example.com',
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

      mockUsersService.updateAddressByUserId.mockResolvedValue(mockAddress);

      const result = await controller.updateUserAddress(mockUser.id, updateAddressDto, { user: mockUser });

      expect(result).toEqual(mockAddress);
      expect(mockUsersService.updateAddressByUserId).toHaveBeenCalledWith(
        mockUser.id,
        updateAddressDto,
        mockUser,
      );
    });

    it('should throw ForbiddenException if non-admin user tries to update another user address', async () => {
      const mockUser: User = {
        id: '1',
        role: 'USER',
        firstName: 'John',
        lastName: 'Doe',
        email: 'johnDoe@example.com',
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

      mockUsersService.updateAddressByUserId.mockRejectedValue(
        new ForbiddenException(),
      );

      await expect(
        controller.updateUserAddress('2', updateAddressDto, { user: mockUser }),
      ).rejects.toThrow(ForbiddenException);

      expect(mockUsersService.updateAddressByUserId).toHaveBeenCalledWith(
        '2',
        updateAddressDto,
        mockUser,
      );
    });
  });

  describe('deleteUserAddressByUserId', () => {
    it('should delete a user address by user ID', async () => {
      const mockUser: User = {
        id: '1',
        role: 'USER',
        firstName: 'John',
        lastName: 'Doe',
        email: 'johnDoe@example.com',
        password: 'hashedpassword',
        phone: '1234567890',
        createdAt: new Date(),
        updatedAt: new Date(), 
      };

      mockUsersService.deleteAddressByUserId.mockResolvedValue(undefined);

      await controller.deleteUserAddress(mockUser.id, { user: mockUser });

      expect(mockUsersService.deleteAddressByUserId).toHaveBeenCalledWith(
        mockUser.id,
        mockUser,
      );
    });

    it('should throw ForbiddenException if non-admin user tries to delete another user address', async () => {
      const mockUser: User = {
        id: '1',
        role: 'USER',
        firstName: 'John',
        lastName: 'Doe',
        email: 'johnDoe@example.com',
        password: 'hashedpassword',
        phone: '1234567890',
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockUsersService.deleteAddressByUserId.mockRejectedValue(
        new ForbiddenException(),
      );

      await expect(
        controller.deleteUserAddress('2', { user: mockUser }),
      ).rejects.toThrow(ForbiddenException);

      expect(mockUsersService.deleteAddressByUserId).toHaveBeenCalledWith(
        '2',
        mockUser,
      );
    });
  });
});