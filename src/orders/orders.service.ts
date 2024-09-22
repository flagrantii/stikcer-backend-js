import {
  Injectable,
  Logger,
  NotFoundException,
  ForbiddenException,
  InternalServerErrorException,
} from '@nestjs/common';
import { DatabaseService } from '../database/database.service';
import { Order, User } from '@prisma/client';
import { CreateOrderDto } from './dto/create-order.dto';
import { UpdateOrderDto } from './dto/update-order.dto';
import * as uuid from 'uuid';

@Injectable()
export class OrdersService {
  private readonly logger = new Logger(OrdersService.name);

  constructor(private readonly databaseService: DatabaseService) {}

  async createOrder(
    createOrderDto: CreateOrderDto,
    user: User,
  ): Promise<Order> {
    this.logger.log(`Attempting to create a new order for user: ${user.id}`);
    try {
      const orderId = uuid.v4();

      return await this.databaseService.$transaction(async (prisma) => {
        let subTotal = 0;
        for (const item of createOrderDto.items) {
          const product = await prisma.product.findUnique({
            where: { id: item.productId },
          });
          if (!product) {
            throw new NotFoundException(
              `Product with id ${item.productId} not found`,
            );
          }
          subTotal += product.unitPrice * product.amount;
        }

        const order = await prisma.order.create({
          data: {
            id: orderId,
            userId: user.id,
            orderSubTotal: subTotal,
            shippingFee: createOrderDto.shippingFee,
            shippingMethod: createOrderDto.shippingMethod,
            paymentId: createOrderDto.paymentId,
            status: createOrderDto.status,
            orderLines: {
              create: createOrderDto.items.map((item) => ({
                productId: item.productId,
                orderId: orderId,
              })),
            },
          },
          include: { orderLines: true },
        });

        return order;
      });
    } catch (error) {
      this.logger.error(
        `Failed to create order: ${error.message}`,
        error.stack,
      );
      throw new InternalServerErrorException('Failed to create order');
    }
  }

  async findAllOrders(user: User): Promise<Order[]> {
    this.logger.log(`Attempting to find all orders for user: ${user.id}`);
    try {
      if (user.role !== 'ADMIN') {
        throw new ForbiddenException(
          'You are not authorized to access all orders',
        );
      }
      const orders = await this.databaseService.order.findMany({
        include: { orderLines: true },
      });
      return orders;
    } catch (error) {
      this.logger.error(
        `Failed to fetch orders: ${error.message}`,
        error.stack,
      );
      throw error;
    }
  }

  async findOrdersByUserId(userId: string, user: User): Promise<Order[]> {
    this.logger.log(`Attempting to find orders for user with id: ${userId}`);
    try {
      if (user.role !== 'ADMIN' && user.id !== userId) {
        throw new ForbiddenException(
          'You are not authorized to access these orders',
        );
      }
      const orders = await this.databaseService.order.findMany({
        where: { userId },
        include: { orderLines: true },
      });
      return orders;
    } catch (error) {
      this.logger.error(
        `Failed to fetch orders: ${error.message}`,
        error.stack,
      );
      throw error;
    }
  }

  async findOrderById(id: string, user: User): Promise<Order> {
    this.logger.log(`Attempting to find order with id: ${id}`);
    try {
      const order = await this.databaseService.order.findUnique({
        where: { id },
        include: { orderLines: true },
      });

      if (!order) {
        throw new NotFoundException('Order not found');
      }

      if (user.role !== 'ADMIN' && order.userId !== user.id) {
        throw new ForbiddenException(
          'You are not authorized to access this order',
        );
      }

      return order;
    } catch (error) {
      this.logger.error(`Failed to fetch order: ${error.message}`, error.stack);
      throw error;
    }
  }

  async updateOrderById(
    id: string,
    updateOrderDto: UpdateOrderDto,
    user: User,
  ): Promise<Order> {
    this.logger.log(`Attempting to update order with id: ${id}`);
    try {
      const existingOrder = await this.databaseService.order.findUnique({
        where: { id },
        include: { orderLines: true },
      });

      if (!existingOrder) {
        throw new NotFoundException('Order not found');
      }

      if (user.role !== 'ADMIN' && existingOrder.userId !== user.id) {
        throw new ForbiddenException(
          'You are not authorized to update this order',
        );
      }

      const updatedOrder = await this.databaseService.order.update({
        where: { id },
        data: updateOrderDto,
        include: { orderLines: true },
      });

      return updatedOrder;
    } catch (error) {
      this.logger.error(
        `Failed to update order: ${error.message}`,
        error.stack,
      );
      throw error;
    }
  }

  async deleteOrderById(id: string, user: User): Promise<void> {
    this.logger.log(`Attempting to delete order with id: ${id}`);
    try {
      const existingOrder = await this.databaseService.order.findUnique({
        where: { id },
      });

      if (!existingOrder) {
        throw new NotFoundException('Order not found');
      }

      if (user.role !== 'ADMIN' && existingOrder.userId !== user.id) {
        throw new ForbiddenException(
          'You are not authorized to delete this order',
        );
      }

      await this.databaseService.order.delete({ where: { id } });
    } catch (error) {
      this.logger.error(
        `Failed to delete order: ${error.message}`,
        error.stack,
      );
      throw error;
    }
  }
}
