import { Injectable, NotFoundException, UnauthorizedException, Logger } from '@nestjs/common';
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

  async findUserProfile(id: number, requestingUser: User): Promise<User> {
    if (requestingUser.role !== 'ADMIN' && requestingUser.id !== id) {
      throw new UnauthorizedException('You are not authorized to access this user');
    }
    const user = await this.databaseService.user.findUnique({ where: { id: id } });
    if (!user) {
      throw new NotFoundException('User not found');
    }
    delete user.password;
    return user;
  }

  async findAllUsers(requestingUser: User): Promise<User[]> {
    if (requestingUser.role !== 'ADMIN') {
      throw new UnauthorizedException('You are not authorized to access this resource');
    }
    return this.databaseService.user.findMany();
  }

  async updateUserById(id: number, updateUserDto: UpdateUserDto, requestingUser: User): Promise<User> {
    const existingUser = await this.databaseService.user.findUnique({ where: { id } });
    if (!existingUser) {
      throw new NotFoundException('User not found');
    }

    if (requestingUser.role !== 'ADMIN' && requestingUser.id !== existingUser.id) {
      throw new UnauthorizedException('You are not authorized to update this user');
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
  }

  async deleteUserById(id: number, requestingUser: User): Promise<void> {
    const existingUser = await this.databaseService.user.findUnique({ where: { id } });
    if (!existingUser) {
      throw new NotFoundException('User not found');
    }

    if (requestingUser.role !== 'ADMIN' && requestingUser.id !== existingUser.id) {
      throw new UnauthorizedException('You are not authorized to delete this user');
    }

    await this.databaseService.user.delete({ where: { id } });
  }

  async insertAddress(addressDto: CreateAddressDto): Promise<Address> {
    try {
      return await this.databaseService.address.create({ data: addressDto });
    } catch (error) {
      this.logger.error(`Failed to insert address: ${error.message}`, error.stack);
      if (error.code === 'P2002' && error.meta?.target?.includes('userId')) {
        throw new Error('This user already has an address.');
      }
      throw error;
    }
  }

  async findAddressByUserId(userId: number, requestingUser: User): Promise<Address> {
    if (requestingUser.role !== 'ADMIN' && requestingUser.id !== userId) {
      throw new UnauthorizedException('You are not authorized to access this address');
    }
    const address = await this.databaseService.address.findUnique({ where: { userId } });
    if (!address) {
      throw new NotFoundException('Address not found for this user');
    }
    return address;
  }

  async updateAddressByUserId(userId: number, updateAddressDto: UpdateAddressDto, requestingUser: User): Promise<Address> {
    const existingAddress = await this.databaseService.address.findUnique({ where: { userId } });
    
    if (requestingUser.role !== 'ADMIN' && requestingUser.id !== userId) {
      throw new UnauthorizedException('You are not authorized to update this address');
    }

    if (!existingAddress) {
      if (requestingUser.role === 'ADMIN') {
        throw new NotFoundException('Address not found for this user');
      } else {
        throw new NotFoundException('You have never added your address before. Please add an address first.');
      }
    }

    return this.databaseService.address.update({
      where: { userId },
      data: updateAddressDto,
    });
  }

  async deleteAddressByUserId(userId: number, requestingUser: User): Promise<void> {
    const existingAddress = await this.databaseService.address.findUnique({ where: { userId } });
    
    if (requestingUser.role !== 'ADMIN' && requestingUser.id !== userId) {
      throw new UnauthorizedException('You are not authorized to delete this address');
    }

    if (!existingAddress) {
      if (requestingUser.role === 'ADMIN') {
        throw new NotFoundException('Address not found for this user');
      } else {
        throw new NotFoundException('You have never added your address before.');
      }
    }

    await this.databaseService.address.delete({ where: { userId } });
  }
}
