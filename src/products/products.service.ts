import { Injectable } from '@nestjs/common';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { Product, User } from '@prisma/client';
import { DatabaseService } from 'src/database/database.service';
import * as uuid from 'uuid';

@Injectable()
export class ProductsService {
  constructor(private readonly databaseService: DatabaseService) {}

  async InsertProduct(
    createProductDto: CreateProductDto,
    user: User,
  ): Promise<{ product: Product; err: string }> {
    try {
      const productId = parseInt(uuid.v4().replace(/-/g, ''), 16);

      return await this.databaseService.$transaction(async (prisma) => {
        const product = await prisma.product.create({
          data: {
            id: productId,
            categoryId: createProductDto.categoryId,
            userId: user.id,
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
          },
        });

        const fileId = parseInt(uuid.v4().replace(/-/g, ''), 16);
        await prisma.file.create({
          data: {
            id: fileId,
            productId: product.id,
            categoryId: createProductDto.categoryId,
            userId: user.id,
            url: createProductDto.fileUrl,
            type: createProductDto.fileType,
            isPurchased: false,
            name: `${product.id}`,
            size: createProductDto.fileSize,
          },
        });

        return {
          product,
          err: null,
        };
      });
    } catch (err) {
      console.log('Error: ', err);
      return {
        product: null,
        err: err.message,
      };
    }
  }

  async FindAllProducts(
    user: User,
  ): Promise<{ products: Product[]; err: string }> {
    try {
      if (user.role === 'ADMIN') {
        const products = await this.databaseService.product.findMany({
          include: {
            category: true,
          },
        });

        return {
          products,
          err: null,
        };
      } else if (user.role === 'USER') {
        const products = await this.databaseService.product.findMany({
          where: {
            userId: user.id,
          },
          include: {
            category: true,
          },
        });

        return {
          products,
          err: null,
        };
      }
    } catch (err) {
      console.log('Error: ', err);
      return {
        products: null,
        err: err.message,
      };
    }
  }

  async FindProductById(
    id: number,
    user: User,
  ): Promise<{ product: Product; err: string }> {
    try {
      const product = await this.databaseService.product.findUnique({
        where: { id },
        include: { category: true },
      });

      if (!product) {
        return { product: null, err: 'not found this product' };
      }

      if (user.role === 'USER' && product.userId !== user.id) {
        return {
          product: null,
          err: 'You are not authorized to access this product',
        };
      }

      return { product, err: null };
    } catch (err) {
      console.log('Error: ', err);
      return { product: null, err: err.message };
    }
  }

  async FindAllProductsByUserId(
    userId: number,
    user: User,
  ): Promise<{ products: Product[]; err: string }> {
    try {
      if (user.role === 'ADMIN') {
        const products = await this.databaseService.product.findMany({
          where: {
            userId,
          },
        });

        return {
          products,
          err: null,
        };
      } else if (user.role === 'USER') {
        return {
          products: [],
          err: 'You are not authorized to access this product',
        };
      }
    } catch (err) {
      console.log('Error: ', err);
      return {
        products: null,
        err: err.message,
      };
    }
  }

  async FindAllProductsByCategoryId(
    categoryId: number,
    user: User,
  ): Promise<{ products: Product[]; err: string }> {
    try {
      if (user.role === 'ADMIN') {
        const products = await this.databaseService.product.findMany({
          where: {
            categoryId,
          },
          include: {
            category: true,
          },
        });

        return {
          products,
          err: null,
        };
      } else if (user.role === 'USER') {
        const products = await this.databaseService.product.findMany({
          where: {
            categoryId,
            userId: user.id,
          },
          include: {
            category: true,
          },
        });
        return {
          products,
          err: null,
        };
      }
    } catch (err) {
      console.log('Error: ', err);
      return {
        products: null,
        err: err.message,
      };
    }
  }

  async UpdateProductById(
    id: number,
    updateProductDto: UpdateProductDto,
    user: User,
  ): Promise<{ product: Product; err: string }> {
    try {
      const existed = await this.databaseService.product.findUnique({
        where: {
          id,
        },
      });

      if (!existed) {
        return {
          product: null,
          err: 'not found this product',
        };
      }

      if (user.role === 'ADMIN') {
        const product = await this.databaseService.product.update({
          where: {
            id,
          },
          data: updateProductDto,
        });

        return {
          product,
          err: null,
        };
      } else if (user.role === 'USER') {
        if (existed.userId !== user.id) {
          return {
            product: null,
            err: 'You are not authorized to access this product',
          };
        }
        const product = await this.databaseService.product.update({
          where: {
            id,
          },
          data: updateProductDto,
        });

        return {
          product,
          err: null,
        };
      }
    } catch (err) {
      console.log('Error: ', err);
      return {
        product: null,
        err: err.message,
      };
    }
  }

  async DeleteProductById(id: number, user: User): Promise<{ err: string }> {
    try {
      const existed = await this.databaseService.product.findUnique({
        where: {
          id,
        },
      });

      if (!existed) {
        return {
          err: 'not found this product',
        };
      }

      if (user.role === 'ADMIN') {
        await this.databaseService.product.delete({
          where: {
            id,
          },
        });

        return {
          err: null,
        };
      } else if (user.role === 'USER') {
        if (existed.userId !== user.id) {
          return {
            err: 'You are not authorized to access this product',
          };
        }

        await this.databaseService.product.delete({
          where: {
            id,
          },
        });

        return {
          err: null,
        };
      }
    } catch (err) {
      console.log('Error: ', err);
      return {
        err: err.message,
      };
    }
  }
}
