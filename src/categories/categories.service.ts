import { Injectable } from '@nestjs/common';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { ProductCategory, User } from '@prisma/client';
import { DatabaseService } from 'src/database/database.service';

@Injectable()
export class CategoriesService {
  constructor(private readonly databaseService: DatabaseService) {}

  async InsertCategory(
    createCategoryDto: CreateCategoryDto,
    user: User,
  ): Promise<{ category: ProductCategory; err: string }> {
    try {
      if (user.role !== 'ADMIN') {
        return {
          category: null,
          err: 'You are not authorized to access this category',
        };
      }

      const category = await this.databaseService.productCategory.create({
        data: createCategoryDto,
      });

      return {
        category,
        err: null,
      };
    } catch (err) {
      console.log('Error: ', err);
      return {
        category: null,
        err: err.message,
      };
    }
  }

  async FindAllCategories(): Promise<{
    categories: ProductCategory[];
    err: string;
  }> {
    try {
      const categories = await this.databaseService.productCategory.findMany();

      return {
        categories,
        err: null,
      };
    } catch (err) {
      console.log('Error: ', err);
      return {
        categories: null,
        err: err.message,
      };
    }
  }

  async FindCategoryById(
    id: number,
  ): Promise<{ category: ProductCategory; err: string }> {
    try {
      const category = await this.databaseService.productCategory.findUnique({
        where: {
          id,
        },
      });

      if (!category) {
        return {
          category: null,
          err: 'not found this category',
        };
      }

      return {
        category,
        err: null,
      };
    } catch (err) {
      console.log('Error: ', err);
      return {
        category: null,
        err: err.message,
      };
    }
  }

  async UpdateCategoryById(
    id: number,
    updateCategoryDto: UpdateCategoryDto,
    user: User,
  ): Promise<{ category: ProductCategory; err: string }> {
    try {
      if (user.role !== 'ADMIN') {
        return {
          category: null,
          err: 'You are not authorized to access this category',
        };
      }

      const existed = await this.databaseService.productCategory.findUnique({
        where: {
          id,
        },
      });

      if (!existed) {
        return {
          category: null,
          err: 'not found this category',
        };
      }

      const category = await this.databaseService.productCategory.update({
        where: {
          id,
        },
        data: updateCategoryDto,
      });

      return {
        category,
        err: null,
      };
    } catch (err) {
      console.log('Error: ', err);
      return {
        category: null,
        err: err.message,
      };
    }
  }

  async DeleteCategoryById(id: number, user: User): Promise<{ err: string }> {
    try {
      if (user.role !== 'ADMIN') {
        return {
          err: 'You are not authorized to access this category',
        };
      }

      const existed = await this.databaseService.productCategory.findUnique({
        where: {
          id,
        },
      });

      if (!existed) {
        return {
          err: 'not found this category',
        };
      }

      await this.databaseService.productCategory.delete({
        where: {
          id,
        },
      });

      return {
        err: null,
      };
    } catch (err) {
      console.log('Error: ', err);
      return {
        err: err.message,
      };
    }
  }
}
