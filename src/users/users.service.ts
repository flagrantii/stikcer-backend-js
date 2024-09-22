import {
  Injectable,
  NotFoundException,
  Logger,
  ForbiddenException,
} from '@nestjs/common';
import { UpdateUserDto } from './dto/update-user.dto';
import { DatabaseService } from '../database/database.service';
import { Address, User } from '@prisma/client';
import * as bcrypt from 'bcryptjs';
import { CreateAddressDto } from './dto/create-address.dto';
import { UpdateAddressDto } from './dto/update-address.dto';

@Injectable()
export class UsersService {
  private readonly logger = new Logger(UsersService.name);

  constructor(private readonly databaseService: DatabaseService) {}

  async findUserProfile(id: string, requestingUser: User): Promise<User> {
    this.logger.log(`Attempting to find user profile with id: ${id}`);
    try {
      if (requestingUser.role !== 'ADMIN' && requestingUser.id !== id) {
        throw new ForbiddenException(
          'You are not authorized to access this user',
        );
      }
      const user = await this.databaseService.user.findUnique({
        where: { id: id },
      });
      if (!user) {
        throw new NotFoundException('User not found');
      }
      delete user.password;
      return user;
    } catch (error) {
      this.logger.error(
        `Error finding user profile: ${error.message}`,
        error.stack,
      );
      throw error;
    }
  }

  async findAllUsers(requestingUser: User): Promise<User[]> {
    this.logger.log('Attempting to find all users');
    try {
      if (requestingUser.role !== 'ADMIN') {
        throw new ForbiddenException(
          'You are not authorized to access this resource',
        );
      }
      const users = await this.databaseService.user.findMany();
      return users.map((user) => {
        delete user.password;
        return user;
      });
    } catch (error) {
      this.logger.error(
        `Error finding all users: ${error.message}`,
        error.stack,
      );
      throw error;
    }
  }

  async updateUserById(
    id: string,
    updateUserDto: UpdateUserDto,
    requestingUser: User,
  ): Promise<User> {
    this.logger.log(`Attempting to update user with id: ${id}`);
    try {
      const existingUser = await this.databaseService.user.findUnique({
        where: { id },
      });
      if (!existingUser) {
        throw new NotFoundException('User not found');
      }

      if (
        requestingUser.role !== 'ADMIN' &&
        requestingUser.id !== existingUser.id
      ) {
        throw new ForbiddenException(
          'You are not authorized to update this user',
        );
      }

      if (updateUserDto.password) {
        updateUserDto.password = await bcrypt.hash(updateUserDto.password, 10);
      }

      const updatedUser = await this.databaseService.user.update({
        where: { id },
        data: updateUserDto,
      });

      delete updatedUser.password;
      return updatedUser;
    } catch (error) {
      this.logger.error(`Error updating user: ${error.message}`, error.stack);
      throw error;
    }
  }

  async deleteUserById(id: string, requestingUser: User): Promise<void> {
    this.logger.log(`Attempting to delete user with id: ${id}`);
    try {
      const existingUser = await this.databaseService.user.findUnique({
        where: { id },
      });
      if (!existingUser) {
        throw new NotFoundException('User not found');
      }

      if (
        requestingUser.role !== 'ADMIN' &&
        requestingUser.id !== existingUser.id
      ) {
        throw new ForbiddenException(
          'You are not authorized to delete this user',
        );
      }

      await this.databaseService.user.delete({ where: { id } });
    } catch (error) {
      this.logger.error(`Error deleting user: ${error.message}`, error.stack);
      throw error;
    }
  }

  async insertAddress(
    addressDto: CreateAddressDto,
    user: User,
  ): Promise<Address> {
    this.logger.log('Attempting to insert address');
    try {
      return await this.databaseService.address.create({
        data: { ...addressDto, userId: user.id },
      });
    } catch (error) {
      this.logger.error(
        `Failed to insert address: ${error.message}`,
        error.stack,
      );
      if (error.code === 'P2002' && error.meta?.target?.includes('userId')) {
        throw new ForbiddenException('This user already has an address.');
      }
      throw error;
    }
  }

  async findAddressByUserId(
    userId: string,
    requestingUser: User,
  ): Promise<Address> {
    this.logger.log(`Attempting to find address for user with id: ${userId}`);
    try {
      if (requestingUser.role !== 'ADMIN' && requestingUser.id !== userId) {
        throw new ForbiddenException(
          'You are not authorized to access this address',
        );
      }
      const address = await this.databaseService.address.findUnique({
        where: { userId },
      });
      if (!address) {
        throw new NotFoundException('Address not found for this user');
      }
      return address;
    } catch (error) {
      this.logger.error(`Error finding address: ${error.message}`, error.stack);
      throw error;
    }
  }

  async updateAddressByUserId(
    userId: string,
    updateAddressDto: UpdateAddressDto,
    requestingUser: User,
  ): Promise<Address> {
    this.logger.log(`Attempting to update address for user with id: ${userId}`);
    try {
      const existingAddress = await this.databaseService.address.findUnique({
        where: { userId },
      });

      if (requestingUser.role !== 'ADMIN' && requestingUser.id !== userId) {
        throw new ForbiddenException(
          'You are not authorized to update this address',
        );
      }

      if (!existingAddress) {
        if (requestingUser.role === 'ADMIN') {
          throw new NotFoundException('Address not found for this user');
        } else {
          throw new NotFoundException(
            'You have never added your address before. Please add an address first.',
          );
        }
      }

      return this.databaseService.address.update({
        where: { userId },
        data: updateAddressDto,
      });
    } catch (error) {
      this.logger.error(
        `Error updating address: ${error.message}`,
        error.stack,
      );
      throw error;
    }
  }

  async deleteAddressByUserId(
    userId: string,
    requestingUser: User,
  ): Promise<void> {
    this.logger.log(`Attempting to delete address for user with id: ${userId}`);
    try {
      const existingAddress = await this.databaseService.address.findUnique({
        where: { userId },
      });

      if (requestingUser.role !== 'ADMIN' && requestingUser.id !== userId) {
        throw new ForbiddenException(
          'You are not authorized to delete this address',
        );
      }

      if (!existingAddress) {
        if (requestingUser.role === 'ADMIN') {
          throw new NotFoundException('Address not found for this user');
        } else {
          throw new NotFoundException(
            'You have never added your address before.',
          );
        }
      }

      await this.databaseService.address.delete({ where: { userId } });
    } catch (error) {
      this.logger.error(
        `Error deleting address: ${error.message}`,
        error.stack,
      );
      throw error;
    }
  }
}
