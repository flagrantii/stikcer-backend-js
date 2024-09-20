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
import { OrdersService } from './orders.service';
import { Response } from 'express';
import { CreateOrderDto } from './dto/create-order.dto';
import { Order } from '@prisma/client';
import { UpdateOrderDto } from './dto/update-order.dto';

@Controller('orders')
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  @Post()
  async CreateOrder(
    @Req() req: Request,
    @Res() res: Response,
    @Body() createOrderDataDto: CreateOrderDto,
  ) {
    createOrderDataDto.userId = req['user'].id;
    const { order, err } =
      await this.ordersService.InsertOrderWithLines(createOrderDataDto);
    if (err !== null) {
      return res.status(500).json({
        success: false,
        message: err,
      });
    }

    return res.status(201).json({
      success: true,
      data: order,
    });
  }

  @Get()
  async GetAllOrders(@Req() req: Request, @Res() res: Response) {
    let orders: Order[];
    let err: string;

    const userRole: string = req['user'].role;

    switch (userRole) {
      case 'ADMIN':
        ({ orders, err } = await this.ordersService.FindAllOrders(req['user']));
        break;
      case 'USER':
        ({ orders, err } = await this.ordersService.FindOrdersByUserId(
          req['user'].id,
          req['user'],
        ));
        break;
      default:
        err = 'invalid user role';
    }

    if (err !== null) {
      return res.status(500).json({
        success: true,
        message: err,
      });
    }

    return res.status(200).json({
      success: true,
      amount: orders.length,
      data: orders,
    });
  }

  @Get(':id')
  async GetOrderById(
    @Req() req: Request,
    @Res() res: Response,
    @Param('id') id: number,
  ) {
    const { order, err } = await this.ordersService.FindOrderById(id, req);
    if (err !== null) {
      let statusCode: number;
      switch (err) {
        case 'you are not authorized to access this order':
          statusCode = 401;
          break;
        case 'not found this order':
          statusCode = 404;
          break;
        default:
          statusCode = 500;
      }

      return res.status(statusCode).json({
        success: false,
        message: err,
      });
    }

    return res.status(200).json({
      success: true,
      data: order,
    });
  }

  @Get('user/:id')
  async GetOrdersByUserId(
    @Req() req: Request,
    @Res() res: Response,
    @Param('id') id: number,
  ) {
    const { orders, err } = await this.ordersService.FindOrdersByUserId(
      id,
      req['user'],
    );
    if (err !== null) {
      return res.status(500).json({
        success: false,
        message: err,
      });
    }

    return res.status(200).json({
      success: true,
      data: orders,
    });
  }

  @Patch(':id')
  async UpdateOrderById(
    @Req() req: Request,
    @Res() res: Response,
    @Param('id') id: number,
    @Body() updateOrderDto: UpdateOrderDto,
  ) {
    const { order, err } = await this.ordersService.UpdateOrderById(
      id,
      updateOrderDto,
      req['user'],
    );
    if (err !== null) {
      let statusCode: number;
      switch (err) {
        case 'you are not authorized to access this order':
          statusCode = 401;
          break;
        case 'not found this order':
          statusCode = 404;
          break;
        default:
          statusCode = 500;
      }

      return res.status(statusCode).json({
        success: false,
        message: err,
      });
    }

    return res.status(200).json({
      success: true,
      data: order,
    });
  }

  @Delete(':id')
  async DeleteOrderById(
    @Req() req: Request,
    @Res() res: Response,
    @Param('id') id: number,
  ) {
    const { err } = await this.ordersService.DeleteOrderById(id, req);
    if (err !== null) {
      let statusCode: number;
      switch (err) {
        case 'you are not authorized to access this order':
          statusCode = 401;
          break;
        case 'not found this order':
          statusCode = 404;
          break;
        default:
          statusCode = 500;
      }

      return res.status(statusCode).json({
        success: false,
        message: err,
      });
    }

    return res.status(200).json({
      success: true,
      data: {},
    });
  }
}
