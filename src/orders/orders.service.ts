import { Injectable } from '@nestjs/common';
import { Order, User } from '@prisma/client';
import { DatabaseService } from 'src/database/database.service';
import { CreateOrderDto } from './dto/create-order.dto';
import * as uuid from 'uuid'
import { UpdateOrderDto } from './dto/update-order.dto';

@Injectable()
export class OrdersService {
  constructor(private readonly databaseService: DatabaseService) {}

  async InsertOrderWithLines(createOrderDto: CreateOrderDto): Promise<{ order: Order, err: string }> {
    try {
      const orderId: number = parseInt(uuid.v4().split('-').join(''), 16)
      return this.databaseService.$transaction(async (prisma) => {

        //calcuilate subtotal
        let subTotal = 0
        for (let i = 0; i < createOrderDto.items.length; i++) {
          const item = createOrderDto.items[i]
          const product = await prisma.product.findUnique({
            where: {
              id: item.productId
            }
          })

          subTotal += product.unitPrice * product.amount
        }

        //create order
        const createdOrder = await prisma.order.create({
          data: {
            id: orderId,
            userId: createOrderDto.userId,
            orderSubTotal: subTotal,
            shippingFee: createOrderDto.shippingFee,
            shippingMethod: createOrderDto.shippingMethod,
            paymentId: createOrderDto.paymentId,
            status: createOrderDto.status
          }
        })

        //create order lines
        for (let i = 0; i < createOrderDto.items.length; i++) {
          const item = createOrderDto.items[i]
          await prisma.orderLine.createMany({
            data: {
              orderId: orderId,
              productId: item.productId
            }
          })
        }

        return { 
          order: createdOrder, 
          err: null 
        }
      })
    } catch (err) {
      console.log("Error: ", err)
      return { 
        order: null, 
        err 
      }
    }
  }

  async FindAllOrders(user: User): Promise<{ orders: Order[], err: string }> {
    try {
      if (user.role !== "ADMIN") {
        return {
          orders: null,
          err: "you are not authorized to access this order"
        }
      }
      const orders = await this.databaseService.order.findMany({
        include: {
          orderLines: true
        }
      })

      return {
        orders,
        err: null
      }
    } catch (err) {
      console.log("Error: ", err)
      return {
        orders: null,
        err
      }
    }
  }

  async FindOwnOrders(userId: number): Promise<{ orders: Order[], err: string }> {
    try {
      const orders = await this.databaseService.order.findMany({
        where: {
          userId
        },
        include: {
          orderLines: true
        }
      })

      return {
        orders,
        err: null
      }
    } catch (err) {
      console.log("Error: ", err)
      return {
        orders: null,
        err
      }
    }
  }

  async FindOrderById(id: number, req: Request): Promise<{ order: Order, err: string }> {
    try {
      const order = await this.databaseService.order.findUnique({
        where: {
          id
        },
        include: {
          orderLines: true
        }
      })

      // role: admin
      if (req['user'].role === "ADMIN") {
        if (!order) {
          return {
            order: null,
            err: "not found this order"
          }
        }

        return {
          order,
          err: null
        }
      } 
      // role: user
      else if (req['user'].role=== "USER") {
        // ownership validation
        if (order && order.userId === req['user'].id) {
          return {
            order,
            err: null
          }
        } else {
          return {
            order: null,
            err: "you are not authorized to access this order"
          }
        }
      }
    } catch (err) {
      console.log("Error: ", err)
      return {
        order: null,
        err: err.message
      }
    }  
  }

  async UpdateOrderById(id: number, updateOrderDto: UpdateOrderDto, req: Request): Promise<{ order: Order, err: string }> {
    try {
      const order = await this.databaseService.order.findUnique({
        where: {
          id
        }
      })
      if (req['user'].role === "ADMIN") {
        if (!order) {
          return {
            order: null,
            err: "not found this order"
          }
        }
        const updatedOrder = await this.databaseService.order.update({
          where: {
            id
          },
          data: updateOrderDto
        })
        return {
          order: updatedOrder,
          err: null
        }
      }
      else if (req['user'].role === "USER") {
        if (order && order.userId === req['user'].id) {
          const updatedOrder = await this.databaseService.order.update({
            where: {
              id
            },
            data: updateOrderDto
          })
          return {
            order: updatedOrder,
            err: null
          }
        } else {
          return {
            order: null,
            err: "you are not authorized to access this order"
          }
        }
      }
    } catch (err) {
      console.log("Error: ", err)
      return {
        order: null,
        err: err.message
      }
    }
  }

  async DeleteOrderById(id: number, req: Request): Promise<{ err: string }> {
    try {
      const order = await this.databaseService.order.findUnique({
        where: {
          id
        }
      })

      // role: admin
      if (req['user'].role === "ADMIN") {
        if (!order) {
          return {
            err: "not found this order"
          }
        }

        await this.databaseService.order.delete({
          where: {
            id
          }
        })

        return {
          err: null
        }
      }
      // role: user
      else if (req['user'].role === "USER") {
        // ownership validation
        if (order && order.userId === req['user'].id) {
          await this.databaseService.order.delete({
            where: {
              id
            }
          })

          return {
            err: null
          }
        } else {
          return {
            err: "you are not authorized to access this order"
          }
        }
      }
    } catch (err) {
      console.log("Error: ", err)
      return {
        err: err.message
      }
    }  
  }
}
