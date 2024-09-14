import { Injectable } from '@nestjs/common';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { Product } from '@prisma/client';
import { DatabaseService } from 'src/database/database.service';
import * as uuid from 'uuid'

@Injectable()
export class ProductsService {
  constructor(private readonly databaseService: DatabaseService) {}

  async InsertProduct(createProductDto: CreateProductDto): Promise<{ product: Product, err: string }> {
    try {
      const productId = parseInt(uuid.v4().replace(/-/g, ''), 16);
  
      return await this.databaseService.$transaction(async (prisma) => {
        const product = await prisma.product.create({
          data: {
            id: productId,
            categoryId: createProductDto.categoryId,
            userId: createProductDto.userId,
            size: createProductDto.size,
            material: createProductDto.material,
            shape: createProductDto.shape,
            printingSide: createProductDto.printingSide,
            parcelColor: createProductDto.parcelColor,
            inkColor: createProductDto.inkColor,
            unitPrice: createProductDto.unitPrice,
            amount: createProductDto.amount,
            isPurchased: createProductDto.isPurchased || false,
            subTotal: createProductDto.unitPrice * createProductDto.amount,
            note: createProductDto.note || null,
          }
        });
  
        const fileId = parseInt(uuid.v4().replace(/-/g, ''), 16);
        await prisma.file.create({
          data: {
            id: fileId,
            productId: product.id,
            categoryId: createProductDto.categoryId,
            userId: createProductDto.userId,
            url: createProductDto.fileUrl,
            type: createProductDto.fileType,
            isPurchased: false,
            name: `${product.id}`,
            size: createProductDto.fileSize
          }
        });
  
        return {
          product,
          err: null
        };
      });
    } catch (err) {
      console.log("Error: ", err);
      return {
        product: null,
        err: err.message
      };
    }
  }
  

  async FindAllProducts(): Promise<{ products: Product[], err: string }> {
    try {
      const products = await this.databaseService.product.findMany({
        include: {
          category: true
        }
      })

      return {
        products,
        err: null
      }
    } catch (err) {
      console.log("Error: ", err)
      return {
        products: null,
        err: err.message
      }
    }
  }

  async FindProductById(id: number): Promise<{ product: Product, err: string }> {
    try {
      const product = await this.databaseService.product.findUnique({
        where: {
          id
        },
        include: {
          category: true
        }
      })

      if (!product) {
        return {
          product: null,
          err: "not found this product"
        }
      }

      return {
        product,
        err: null
      }
    } catch (err) {
      console.log("Error: ", err)
      return {
        product: null,
        err: err.message
      }
    }  
  }

  async UpdateProductById(id: number, updateProductDto: UpdateProductDto): Promise<{ product: Product, err: string }> {
    try {
      const existed = await this.databaseService.product.findUnique({
        where: {
          id
        }
      })

      if (!existed) {
        return {
          product: null,
          err: "not found this product"
        }
      }

      const product = await this.databaseService.product.update({
        where: {
          id
        },
        data: updateProductDto
      })

      return {
        product,
        err: null
      }

    } catch (err) {
      console.log("Error: ", err)
      return {
        product: null,
        err: err.message
      }
    }  
  }

  async DeleteProductById(id: number): Promise<{ err: string }> {
    try {
      const existed = await this.databaseService.product.findUnique({
        where: {
          id
        }
      })

      if (!existed) {
        return {
          err: "not found this product"
        }
      }

      await this.databaseService.product.delete({
        where: {
          id
        }
      })

      return {
        err: null
      }
    } catch (err) {
      console.log("Error: ", err)
      return {
        err: err.message
      }
    }  
  }
}
