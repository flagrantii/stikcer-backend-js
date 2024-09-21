import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Request,
  HttpStatus,
  HttpCode,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { UpdateUserDto } from './dto/update-user.dto';
import { CreateAddressDto } from './dto/create-address.dto';
import { UpdateAddressDto } from './dto/update-address.dto';
import { RolesGuard } from 'src/auth/guards/roles.guard';
import { Roles } from 'src/auth/decorators/roles.decorator';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiParam, ApiBody } from '@nestjs/swagger';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';

@ApiTags('users')
@Controller('users')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get('me')
  @ApiOperation({ summary: 'Get current user profile' })
  @ApiResponse({ status: 200, description: 'Returns the user profile.' })
  async getProfile(@Request() req) {
    return this.usersService.findUserProfile(req.user.id, req.user);
  }

  @Get('me/address')
  @ApiOperation({ summary: 'Get current user address' })
  @ApiResponse({ status: 200, description: 'Returns the user address.' })
  async getAddress(@Request() req) {
    return this.usersService.findAddressByUserId(req.user.id, req.user);
  }

  @Get()
  @Roles('ADMIN')
  @ApiOperation({ summary: 'Get all users' })
  @ApiResponse({ status: 200, description: 'Returns all users.' })
  async getAllUsers(@Request() req) {
    return this.usersService.findAllUsers(req.user);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a user' })
  @ApiResponse({ status: 200, description: 'The user has been successfully updated.' })
  @ApiParam({ name: 'id', type: 'string' })
  @ApiBody({ type: UpdateUserDto })
  async updateUser(@Param('id') id: string, @Body() updateUserDto: UpdateUserDto, @Request() req) {
    return this.usersService.updateUserById(+id, updateUserDto, req.user);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a user' })
  @ApiResponse({ status: 204, description: 'The user has been successfully deleted.' })
  @ApiParam({ name: 'id', type: 'string' })
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteUser(@Param('id') id: string, @Request() req) {
    await this.usersService.deleteUserById(+id, req.user);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a user by ID' })
  @ApiResponse({ status: 200, description: 'Returns the user.' })
  @ApiParam({ name: 'id', type: 'string' })
  async getUserById(@Param('id') id: string, @Request() req) {
    return this.usersService.findUserProfile(+id, req.user);
  }

  @Get(':id/address')
  @ApiOperation({ summary: 'Get a user\'s address by user ID' })
  @ApiResponse({ status: 200, description: 'Returns the user\'s address.' })
  @ApiParam({ name: 'id', type: 'string' })
  async getUserAddress(@Param('id') id: string, @Request() req) {
    return this.usersService.findAddressByUserId(+id, req.user);
  }

  @Patch(':id/address')
  @ApiOperation({ summary: 'Update a user\'s address' })
  @ApiResponse({ status: 200, description: 'The address has been successfully updated.' })
  @ApiParam({ name: 'id', type: 'string' })
  @ApiBody({ type: UpdateAddressDto })
  async updateUserAddress(
    @Param('id') id: string,
    @Body() updateAddressDto: UpdateAddressDto,
    @Request() req
  ) {
    return this.usersService.updateAddressByUserId(+id, updateAddressDto, req.user);
  }

  @Delete(':id/address')
  @ApiOperation({ summary: 'Delete a user\'s address' })
  @ApiResponse({ status: 204, description: 'The address has been successfully deleted.' })
  @ApiParam({ name: 'id', type: 'string' })
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteUserAddress(@Param('id') id: string, @Request() req) {
    await this.usersService.deleteAddressByUserId(+id, req.user);
  }
}
