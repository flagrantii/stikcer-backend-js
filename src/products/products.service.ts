import {
  Injectable,
  Logger,
  NotFoundException,
  ForbiddenException,
  InternalServerErrorException,
  BadRequestException,
} from '@nestjs/common';
import { DatabaseService } from '../database/database.service';
import { Product, User } from '@prisma/client';
import { CreateProductDto } from './dto/create-product.dto';
import * as uuid from 'uuid';
import { UpdateProductDto } from './dto/update-product.dto';

@Injectable()
export class ProductsService {
  private readonly logger = new Logger(ProductsService.name);

  constructor(private readonly databaseService: DatabaseService) {}

  async createProduct(
    createProductDto: CreateProductDto,
    user: User,
  ): Promise<Product> {
    this.logger.log(`Attempting to create a new product for user: ${user.id}`);
    try {
      const productId = uuid.v4();

      const product = await this.databaseService.$transaction(
        async (prisma) => {
          const product = await prisma.product.create({
            data: {
              id: productId,
              userId: user.id,
              ...createProductDto,
              isPurchased: createProductDto.isPurchased || false,
              subTotal: createProductDto.unitPrice * createProductDto.amount,
            },
          });

          return product;
        },
      );

      return product;
    } catch (error) {
      this.logger.error(
        `Failed to create product: ${error.message}`,
        error.stack,
      );
      throw new InternalServerErrorException('Failed to create product');
    }
  }

  async findAllProducts(user: User): Promise<Product[]> {
    this.logger.log(`Attempting to find all products for user: ${user.id}`);
    try {
      const products = await this.databaseService.product.findMany({
        where: user.role === 'USER' ? { userId: user.id } : {},
        include: { category: true },
      });

      return products;
    } catch (error) {
      this.logger.error(
        `Failed to fetch products: ${error.message}`,
        error.stack,
      );
      throw new InternalServerErrorException('Failed to fetch products');
    }
  }

  async findProductById(id: string, user: User): Promise<Product> {
    this.logger.log(`Attempting to find product with id: ${id}`);
    try {
      const product = await this.databaseService.product.findUnique({
        where: { id },
        include: { category: true },
      });

      if (!product) {
        throw new NotFoundException('Product not found');
      }

      if (user.role === 'USER' && product.userId !== user.id) {
        throw new ForbiddenException(
          'You are not authorized to access this product',
        );
      }

      return product;
    } catch (error) {
      this.logger.error(
        `Failed to fetch product: ${error.message}`,
        error.stack,
      );
      throw error;
    }
  }

  async updateProductById(
    id: string,
    updateProductDto: UpdateProductDto,
    user: User,
  ): Promise<Product> {
    this.logger.log(`Attempting to update product with id: ${id}`);
    try {
      const existingProduct = await this.databaseService.product.findUnique({
        where: { id },
      });

      if (!existingProduct) {
        throw new NotFoundException('Product not found');
      }

      if (user.role !== 'ADMIN' && existingProduct.userId !== user.id) {
        throw new ForbiddenException(
          'You are not authorized to update this product',
        );
      }

      if (existingProduct.isPurchased) {
        throw new BadRequestException(
          'Product is already purchased, cannot update',
        );
      }

      const subTotal = this.calculateSubTotal(
        updateProductDto,
        existingProduct,
      );

      const updatedProduct = await this.databaseService.product.update({
        where: { id },
        data: {
          ...updateProductDto,
          subTotal,
        },
      });

      return updatedProduct;
    } catch (error) {
      this.logger.error(
        `Failed to update product: ${error.message}`,
        error.stack,
      );
      throw error;
    }
  }

  async deleteProductById(id: string, user: User): Promise<void> {
    this.logger.log(`Attempting to delete product with id: ${id}`);
    try {
      const existingProduct = await this.databaseService.product.findUnique({
        where: { id },
      });

      if (!existingProduct) {
        throw new NotFoundException('Product not found');
      }

      if (user.role !== 'ADMIN' && existingProduct.userId !== user.id) {
        throw new ForbiddenException(
          'You are not authorized to delete this product',
        );
      }

      await this.databaseService.product.delete({ where: { id } });
    } catch (error) {
      this.logger.error(
        `Failed to delete product: ${error.message}`,
        error.stack,
      );
      throw error;
    }
  }

  async findAllProductsByUserId(
    userId: string,
    user: User,
  ): Promise<Product[]> {
    this.logger.log(
      `Attempting to find all products for user with id: ${userId}`,
    );
    try {
      if (user.role !== 'ADMIN' && user.id !== userId) {
        throw new ForbiddenException(
          'You are not authorized to access these products',
        );
      }

      const products = await this.databaseService.product.findMany({
        where: { userId },
        include: { category: true },
      });

      return products;
    } catch (error) {
      this.logger.error(
        `Failed to fetch products: ${error.message}`,
        error.stack,
      );
      throw error;
    }
  }

  async findAllProductsByCategoryId(
    categoryId: string,
    user: User,
  ): Promise<Product[]> {
    this.logger.log(
      `Attempting to find all products for category with id: ${categoryId}`,
    );
    try {
      const products = await this.databaseService.product.findMany({
        where: {
          categoryId,
          ...(user.role === 'USER' ? { userId: user.id } : {}),
        },
        include: { category: true },
      });

      return products;
    } catch (error) {
      this.logger.error(
        `Failed to fetch products: ${error.message}`,
        error.stack,
      );
      throw new InternalServerErrorException('Failed to fetch products');
    }
  }

  private calculateSubTotal(
    updateProductDto: UpdateProductDto,
    existingProduct: Product,
  ): number {
    const newUnitPrice =
      updateProductDto.unitPrice ?? existingProduct.unitPrice;
    const newAmount = updateProductDto.amount ?? existingProduct.amount;
    return newUnitPrice * newAmount;
  }
}
