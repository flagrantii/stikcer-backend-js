import { Injectable } from '@nestjs/common';
import { CreateCartDto } from './dto/create-cart.dto';
import { UpdateCartDto } from './dto/update-cart.dto';
import { Cart } from '@prisma/client';
import { DatabaseService } from 'src/database/database.service';

@Injectable()
export class CartsService {
  constructor(private readonly databaseService: DatabaseService) {}

  async InsertItemToCart(createCartDto: CreateCartDto): Promise<{ item: Cart, err: string }> {
    try {
      const item = await this.databaseService.cart.create({
        data: createCartDto,
        include: {
          product: true
        }
      })

      return {
        item,
        err: null
      }
    } catch (err) {
      console.log("Error: ", err)
      return {
        item: null,
        err: err.message
      }
    }
  }

  findAll() {
    return `This action returns all carts`;
  }

  findOne(id: number) {
    return `This action returns a #${id} cart`;
  }

  update(id: number, updateCartDto: UpdateCartDto) {
    return `This action updates a #${id} cart`;
  }

  remove(id: number) {
    return `This action removes a #${id} cart`;
  }
}
