import { Body, Controller, Post, Res } from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginUserDto } from './dto/login-user.dto';
import { Response } from 'express';
import { CreateUserDto } from 'src/users/dto/create-user.dto';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('signin')
  async login(
    @Body() loginUserDto: LoginUserDto,
    @Res() res: Response
  ) {
    const { token, err } = await this.authService.login(loginUserDto)
    if (token) {
      return res.status(200).json({
        success: true,
        message: "logged in successfully.",
        token: token
      })
    } else {
      return res.status(err === "User not found" ? 404 : 400).json({
        success: false,
        message: err
      })
    } 
  }

  @Post('signout')
  async logout(
    @Res() res: Response
  ) {
    return res.status(200).json({
      success: true,
      message: "logged out successfully."
    })
  }

  @Post('signup')
  async register(
    @Body() crateUserDto : CreateUserDto,
    @Res() res: Response
  ) {
    const { user, err, token } = await this.authService.InsertUser(crateUserDto)
    if (err !== null) {
      return res.status(500).json({
        success: false,
        message: err,
        token: null
      })
    } else {
      return res.status(201).json({
        success: true,
        data: user,
        token: token
      })
    }
  }
}
