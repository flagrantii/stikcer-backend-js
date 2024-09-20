import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Res,
  Req,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { UpdateUserDto } from './dto/update-user.dto';
import { Request, Response } from 'express';
import { CreateAddressDto } from './dto/create-address.dto';
import { UpdateAddressDto } from './dto/update-address.dto';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get('me')
  async GetProfile(@Req() req: Request, @Res() res: Response) {
    const { user, err } = await this.usersService.FindUserProfile(
      req['user'].id,
    );
    if (err !== null) {
      return res.status(400).json({
        success: false,
        message: err,
      });
    } else {
      return res.status(200).json({
        success: true,
        data: user,
      });
    }
  }

  @Get('me/address')
  async GetAddress(@Req() req: Request, @Res() res: Response) {
    const { address, err } = await this.usersService.FindAddressByUserId(
      req['user'].id,
    );
    if (err !== null) {
      return res.status(400).json({
        success: false,
        message: err,
      });
    } else {
      return res.status(200).json({
        success: true,
        data: address,
      });
    }
  }

  @Post('me/address')
  async CreateAddress(
    @Req() req: Request,
    @Res() res: Response,
    @Body() createAddressDto: CreateAddressDto,
  ) {
    createAddressDto.userId = req['user'].id;

    const { address, err } =
      await this.usersService.InsertAddress(createAddressDto);
    if (err !== null) {
      return res.status(500).json({
        success: false,
        message: err,
      });
    } else {
      return res.status(201).json({
        success: true,
        data: address,
      });
    }
  }

  @Patch('me/address')
  async UpdateAddressById(
    @Req() req: Request,
    @Res() res: Response,
    @Body() updateAddressDto: UpdateAddressDto,
  ) {
    const { address, err } = await this.usersService.UpdateAddressByUserId(
      req['user'].id,
      updateAddressDto,
      req,
    );
    if (err !== null) {
      return res.status(400).json({
        success: false,
        message: err,
      });
    } else {
      return res.status(200).json({
        success: true,
        data: address,
      });
    }
  }

  @Delete('me/address')
  async DeleteAddress(@Req() req: Request, @Res() res: Response) {
    const { err } = await this.usersService.DeleteAddressByUserId(
      req['user'].id,
      req,
    );
    if (err !== null) {
      return res.status(400).json({
        success: false,
        message: err,
      });
    } else {
      return res.status(200).json({
        success: true,
        data: {},
      });
    }
  }

  @Get()
  async GetAllUsers(@Req() req: Request, @Res() res: Response) {
    const { users, err } = await this.usersService.FindAllUsers(req);
    if (err !== null) {
      switch (err) {
        case 'not found any user':
          return res.status(404).json({
            success: false,
            message: err,
            data: [],
          });
        default:
          return res.status(500).json({
            success: false,
            message: err,
          });
      }
    } else {
      return res.status(200).json({
        success: true,
        amount: users.length,
        data: users,
      });
    }
  }

  @Patch(':userId')
  async UpdateUserById(
    @Req() req: Request,
    @Res() res: Response,
    @Param('id') id: string,
    @Body() updateUserDto: UpdateUserDto,
  ) {
    const { user, err } = await this.usersService.UpdateUserById(
      +id,
      updateUserDto,
      req,
    );
    if (err !== null) {
      let statusCode: number;
      switch (err) {
        case 'not found this user':
          statusCode = 404;
          break;
        case 'you are not authorized to access this user':
          statusCode = 401;
          break;
        default:
          statusCode = 500;
      }

      return res.status(statusCode).json({
        success: false,
        message: err,
      });
    } else {
      return res.status(200).json({
        success: true,
        data: user,
      });
    }
  }

  @Delete(':userId')
  async DeleteUserById(
    @Req() req: Request,
    @Res() res: Response,
    @Param('id') id: string,
  ) {
    const { err } = await this.usersService.DeleteUserById(+id, req);
    if (err !== null) {
      let statusCode: number;
      switch (err) {
        case 'not found this user':
          statusCode = 404;
          break;
        case 'you are not authorized to access this user':
          statusCode = 401;
          break;
        default:
          statusCode = 500;
      }

      return res.status(statusCode).json({
        success: false,
        message: err,
      });
    } else {
      return res.status(200).json({
        success: true,
        data: {},
      });
    }
  }

  @Get(':userId')
  async GetUserById(
    @Req() req: Request,
    @Res() res: Response,
    @Param('id') id: string,
  ) {
    const { user, err } = await this.usersService.FindUserProfile(+id);
    if (err !== null) {
      let statusCode: number;
      switch (err) {
        case 'not found this user':
          statusCode = 404;
          break;
        default:
          statusCode = 500;
      }

      return res.status(statusCode).json({
        success: false,
        message: err,
      });
    } else {
      return res.status(200).json({
        success: true,
        data: user,
      });
    }
  }

  @Get(':userId/address')
  async GetUserAddress(@Res() res: Response, @Param('id') id: string) {
    const { address, err } = await this.usersService.FindAddressByUserId(+id);
    if (err !== null) {
      let statusCode: number;
      switch (err) {
        case 'not found this user':
          statusCode = 404;
          break;
        case 'not found any address':
          statusCode = 404;
          break;
        default:
          statusCode = 500;
      }

      return res.status(statusCode).json({
        success: false,
        message: err,
      });
    } else {
      return res.status(200).json({
        success: true,
        data: address,
      });
    }
  }

  @Get(':userId/address')
  async GetUserAddressById(@Res() res: Response, @Param('id') id: string) {
    const { address, err } = await this.usersService.FindAddressByUserId(+id);
    if (err !== null) {
      let statusCode: number;
      switch (err) {
        case 'not found this address':
          statusCode = 404;
          break;
        default:
          statusCode = 500;
      }

      return res.status(statusCode).json({
        success: false,
        message: err,
      });
    } else {
      return res.status(200).json({
        success: true,
        data: address,
      });
    }
  }

  @Patch(':userId/address')
  async UpdateUserAddressById(
    @Req() req: Request,
    @Res() res: Response,
    @Param('addressId') addressId: string,
    @Body() updateAddressDto: UpdateAddressDto,
  ) {
    const { address, err } = await this.usersService.UpdateAddressByUserId(
      +addressId,
      updateAddressDto,
      req,
    );
    if (err !== null) {
      let statusCode: number;
      switch (err) {
        case 'not found this address':
          statusCode = 404;
          break;
        default:
          statusCode = 500;
      }

      return res.status(statusCode).json({
        success: false,
        message: err,
      });
    } else {
      return res.status(200).json({
        success: true,
        data: address,
      });
    }
  }

  @Delete(':userId/address')
  async DeleteUserAddressById(
    @Req() req: Request,
    @Res() res: Response,
    @Param('addressId') addressId: string,
  ) {
    const { err } = await this.usersService.DeleteAddressByUserId(
      +addressId,
      req,
    );
    if (err !== null) {
      let statusCode: number;
      switch (err) {
        case 'not found this address':
          statusCode = 404;
          break;
        default:
          statusCode = 500;
      }

      return res.status(statusCode).json({
        success: false,
        message: err,
      });
    } else {
      return res.status(200).json({
        success: true,
        data: {},
      });
    }
  }
}
