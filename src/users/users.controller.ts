import { Controller, Get, Post, Body, Patch, Param, Delete, Res, Req } from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { Request, Response } from 'express';
import { CreateAddressDto } from './dto/create-address.dto';
import { UpdateAddressDto } from './dto/update-address.dto';
import { register } from 'module';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) { }

  @Get('me')
  async GetProfile(
    @Req() req: Request,
    @Res() res: Response
  ) {
    const { user, err } = await this.usersService.FindUserProfile(req['user'].id)
    if (err !== null) {
      return res.status(400).json({
        success: false,
        message: err
      })
    } else {
      return res.status(200).json({
        success: true,
        data: user
      })
    }
  }

  @Get("me/address")
  async GetAddress(
    @Req() req: Request,
    @Res() res: Response
  ) {
    const { address, err } = await this.usersService.FindUserAddressById(req['user'].id)
    if (err !== null) {
      return res.status(400).json({
        success: false,
        message: err
      })
    } else {
      return res.status(200).json({
        success: true,
        data: address
      })
    }
  }

  @Post("me/address")
  async CreateAddress(
    @Req() req: Request,
    @Res() res: Response,
    @Body() createAddressDto: CreateAddressDto
  ) {
    createAddressDto.userId = req['user'].id

    const { address, err } = await this.usersService.InsertAddress(createAddressDto)
    if (err !== null) {
      return res.status(500).json({
        success: false,
        message: err
      })
    } else {
      return res.status(201).json({
        success: true,
        data: address
      })
    }
  }

  @Get("me/address/:addressId")
  async GetAddressById(
    @Req() req: Request,
    @Res() res: Response,
    @Param('addressId') addressId: string
  ) {
    const { address, err } = await this.usersService.FindAddressById(+addressId)
    if (err !== null) {
      return res.status(400).json({
        success: false,
        message: err
      })
    } else {
      return res.status(200).json({
        success: true,
        data: address
      })
    }
  }

  @Patch("me/address/:addressId")
  async UpdateAddressById(
    @Req() req: Request,
    @Res() res: Response,
    @Param('addressId') addressId: string,
    @Body() updateAddressDto: UpdateAddressDto
  ) {
    const { address, err } = await this.usersService.UpdateAddressById(+addressId, updateAddressDto, req)
    if (err !== null) {
      return res.status(400).json({
        success: false,
        message: err
      })
    } else {
      return res.status(200).json({
        success: true,
        data: address
      })
    }
  }

  @Delete("me/address/:addressId")
  async DeleteAddress(
    @Req() req: Request,
    @Res() res: Response,
    @Param('addressId') addressId: string
  ) {
    const { err } = await this.usersService.DeleteAddressById(+addressId, req['user'].id)
    if (err !== null) {
      return res.status(400).json({
        success: false,
        message: err
      })
    } else {
      return res.status(200).json({
        success: true,
        data: {}
      })
    }
  }

  @Get()
  async GetAllUsers(@Res() res: Response) {
    const { users, err } = await this.usersService.FindAllUsers();
    if (err !== null) {
      switch (err) {
        case "not found any user":
          return res.status(404).json({
            success: false,
            message: err,
            data: []
          })
        default:
          return res.status(500).json({
            success: false,
            message: err,
          })
      }
    } else {
      return res.status(200).json({
        success: true,
        amount: users.length,
        data: users
      })
    }
  }

  @Patch(':userId')
  async UpdateUserById(
    @Req() req: Request,
    @Res() res: Response,
    @Param('id') id: string, 
    @Body() updateUserDto: UpdateUserDto
  ) {
    const { user, err } = await this.usersService.UpdateUserById(+id, updateUserDto, req);
    if (err !== null) {
      let statusCode: number;
      switch (err) {
        case "not found this user":
          statusCode = 404;
          break;
        case "you are not authorized to access this user":
          statusCode = 401;
          break;
        default:
          statusCode = 500;
      }

      return res.status(statusCode).json({
        success: false,
        message: err
      })
    } else {
      return res.status(200).json({
        success: true,
        data: user
      })
    }
  }

  @Delete(':userId')
  async DeleteUserById(
    @Req() req: Request,
    @Res() res: Response,
    @Param('id') id: string
  ) {
    const { err } = await this.usersService.DeleteUserById(+id, req);
    if (err !== null) {
      let statusCode: number;
      switch (err) {
        case "not found this user":
          statusCode = 404;
          break;
        case "you are not authorized to access this user":
          statusCode = 401;
          break;
        default:
          statusCode = 500;
      }

      return res.status(statusCode).json({
        success: false,
        message: err
      })
    } else {
      return res.status(200).json({
        success: true,
        data: {}
      })
    }
  }

  @Get(':userId')
  async GetUserById(
    @Req() req: Request,
    @Res() res: Response,
    @Param('id') id: string
  ) {
    const { user, err } = await this.usersService.FindUserProfile(+id);
    if (err !== null) {
      let statusCode: number;
      switch (err) {
        case "not found this user":
          statusCode = 404;
          break;
        default:
          statusCode = 500;
      }

      return res.status(statusCode).json({
        success: false,
        message: err
      })
    } else {
      return res.status(200).json({
        success: true,
        data: user
      })
    }
  }

  @Get(':userId/address')
  async GetUserAddress(
    @Req() req: Request,
    @Res() res: Response,
    @Param('id') id: string
  ) {
    const { address, err } = await this.usersService.FindUserAddressById(+id);
    if (err !== null) {
      let statusCode: number;
      switch (err) {
        case "not found this user":
          statusCode = 404;
          break;
        case "not found any address":
          statusCode = 404;
          break;
        default:
          statusCode = 500;
      }

      return res.status(statusCode).json({
        success: false,
        message: err
      })
    } else {
      return res.status(200).json({
        success: true,
        data: address
      })
    }
  }

  @Get('address/:addressId')
  async GetUserAddressById(
    @Req() req: Request,
    @Res() res: Response,
    @Param('addressId') addressId: string
  ) {
    const { address, err } = await this.usersService.FindAddressById(+addressId);
    if (err !== null) {
      let statusCode: number;
      switch (err) {
        case "not found this address":
          statusCode = 404;
          break;
        default:
          statusCode = 500;
      }

      return res.status(statusCode).json({
        success: false,
        message: err
      })
    } else {
      return res.status(200).json({
        success: true,
        data: address
      })
    }
  }

  @Patch('address/:addressId')
  async UpdateUserAddressById(
    @Req() req: Request,
    @Res() res: Response,
    @Param('addressId') addressId: string,
    @Body() updateAddressDto: UpdateAddressDto
  ) {
    const { address, err } = await this.usersService.UpdateAddressById(+addressId, updateAddressDto, req);
    if (err !== null) {
      let statusCode: number;
      switch (err) {
        case "not found this address":
          statusCode = 404;
          break;
        default:
          statusCode = 500;
      }

      return res.status(statusCode).json({
        success: false,
        message: err
      })
    } else {
      return res.status(200).json({
        success: true,
        data: address
      })
    }
  }

  @Delete('address/:addressId')
  async DeleteUserAddressById(
    @Req() req: Request,
    @Res() res: Response,
    @Param('addressId') addressId: string
  ) {
    const { err } = await this.usersService.DeleteAddressById(+addressId, req['user'].id);
    if (err !== null) {
      let statusCode: number;
      switch (err) {
        case "not found this address":
          statusCode = 404;
          break;
        default:
          statusCode = 500;
      }

      return res.status(statusCode).json({
        success: false,
        message: err
      })
    } else {
      return res.status(200).json({
        success: true,
        data: {}
      })
    }
  }

}

