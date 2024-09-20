import { Injectable } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { DatabaseService } from 'src/database/database.service';
import { Address, User } from '@prisma/client';
import * as bcrypt from 'bcryptjs'
import { CreateAddressDto } from './dto/create-address.dto';
import { Request } from 'express';
import { UpdateAddressDto } from './dto/update-address.dto';
import { NotFoundException, UnauthorizedException } from '@nestjs/common';

@Injectable()
export class UsersService {
  constructor(
    private readonly databaseService: DatabaseService,
  ) { }
  
  async FindUserProfile(id: number): Promise<{ user: User, err: string }> {
    const user = await this.databaseService.user.findUnique({ where: { id } });
    if (!user) {
      return {
        user: null,
        err: "not found this user"
      }
    }

    delete user.password

    return {
      user,
      err: null
    }
  }

  async FindAllUsers(req: Request): Promise<{ users: User[], err: string }> {
    try {
      const users = await this.databaseService.user.findMany();
      if (!users) {
        return {
          users: null,
          err: "not found any user"
        }
      }

      if (req['user'].role !== 'ADMIN') {
        throw new UnauthorizedException('You are not authorized to access this resource');
      }

      return {
        users,
        err: null
      }
    } catch (err) {
      console.log("Error: ", err);
      return {
        users: null,
        err: err
      }
    }
  }

  async UpdateUserById(id: number, updateUserDto: UpdateUserDto, req: Request): Promise<{ user: User, err: string }> {
    try {
      const existingUser = await this.databaseService.user.findUnique({ where: { id } });

      if (!existingUser) {
        throw new NotFoundException('User not found');
      }

      if (req['user'].role !== 'ADMIN' && req['user'].id !== existingUser.id) {
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

      return { user: updatedUser, err: null };
    } catch (error) {
      console.log("Error: ", error)
      return { user: null, err: error.message };
    }
  }

  async DeleteUserById(id: number, req: Request): Promise<{ err: string }> {
    const existingUser = await this.databaseService.user.findUnique({ where: { id } });

    if (!existingUser) {
      throw new NotFoundException('User not found');
    }

    if (req['user'].role !== 'ADMIN' && req['user'].id !== existingUser.id) {
      throw new UnauthorizedException('You are not authorized to delete this user');
    }

    await this.databaseService.user.delete({
      where: {
        id
      }
    })

    return {
      err: null
    }
  }

  async InsertAddress(addressDto: CreateAddressDto): Promise<{ address: Address, err: string }> {
    try {
      const address = await this.databaseService.address.create({
        data: {
          userId: addressDto.userId,
          reciverName: addressDto.reciverName,
          phone: addressDto.phone,
          address: addressDto.address,
          subDistrict: addressDto.subDistrict || null,
          district: addressDto.district || null,
          province: addressDto.province || null,
          country: addressDto.country,
          postalCode: addressDto.postalCode,
          taxPayerId: addressDto.taxPayerId || null,
          taxPayerName: addressDto.taxPayerName || null
        }
      })

      return {
        address: address,
        err: null
      }
    } catch (err) {
      let message = err.message

      if (err.code === "P2002" && err.meta?.target?.includes("userId")) {
        message = "This user already has address."
      }
      console.log("Error: ", err)

      return {
        address: null,
        err: message
      }
    }
  }

  async FindAddressByUserId(userid: number): Promise<{ address: Address, err: string }> {
    try {
      const address = await this.databaseService.address.findUnique({
        where: {
          userId: userid
        }
      })

      if (!address) {
        return {
          address: null,
          err: "not found this address"
        }
      }

      return {
        address,
        err: null
      }
    } catch (err) {
      console.log("Error: ", err)
      return {
        address: null,
        err: err.message
      }
    }
  }

  async UpdateAddressByUserId(userid: number, updateAddressDto: UpdateAddressDto, req: Request): Promise<{ address: Address, err: string }> {
    try {
      const existed = await this.databaseService.address.findUnique({
        where: {
          userId: userid
        }
      })

      // role: admin
      if (req['user'].role === "ADMIN") {
        if (!existed) {
          return {
            address: null,
            err: "not found this address"
          }
        }

        const address = await this.databaseService.address.update({
          where: {
            userId: userid
          },
          data: updateAddressDto
        })

        return {
          address,
          err: null
        }
      }
      // role: user
      else if (req['user'].role === "USER") {
        // ownership validation
        if (req['user'].id === userid) {
          if (!existed) {
            return {
              address: null,
              err: "you have never added your address before, add now !"
            }
          }

          const address = await this.databaseService.address.update({
            where: {
              userId: userid
            },
            data: updateAddressDto
          })

          return {
            address,
            err: null
          }
        } else {
          return {
            address: null,
            err: "you are not authorized to access this address"
          }
        }
      }
    } catch (err) {
      console.log("Error: ", err)
      return {
        address: null,
        err: err.message
      }
    }
  }

  async DeleteAddressByUserId(userid: number, req: Request): Promise<{ err: string }> {
    try {
      const existed = await this.databaseService.address.findUnique({
        where: {
          userId: userid
        }
      })

      // role: admin
      if (req['user'].role === "ADMIN") {
        if (!existed) {
          return {
            err: "not found this address"
          }
        }

        await this.databaseService.address.delete({
          where: {
            userId: userid
          }
        })

        return {
          err: null
        }
      }
      // role: user
      else if (req['user'].role === "USER") {
        // ownership validation
        if (req['user'].id === userid) {
          if (!existed) {
            return {
              err: "you have never added your address before, add now !"
            }
          }

          await this.databaseService.address.delete({
            where: {
              userId: userid
            }
          })

          return {
            err: null
          }
        } else {
          return {
            err: "you are not authorized to access this address"
          }
        }
      }
    } catch (err) {
      console.log("Error: ", err)
      return {
        err
      }
    }
  }
}
