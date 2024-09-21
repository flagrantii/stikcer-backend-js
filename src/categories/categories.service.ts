import { Injectable, Logger, NotFoundException, ForbiddenException, InternalServerErrorException } from '@nestjs/common';
import { DatabaseService } from '../database/database.service';
import { ProductCategory, User } from '@prisma/client';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';

@Injectable()
export class CategoriesService {
  private readonly logger = new Logger(CategoriesService.name);

  constructor(private readonly databaseService: DatabaseService) {}

  async createCategory(createCategoryDto: CreateCategoryDto, user: User): Promise<ProductCategory> {
    this.logger.log(`Attempting to create a new category`);
    try {
      if (user.role !== 'ADMIN') {
        throw new ForbiddenException('You are not authorized to create categories');
      }

      const category = await this.databaseService.productCategory.create({
        data: createCategoryDto,
      });

      this.logger.log(`Category created successfully: ${category.id}`);
      return category;
    } catch (error) {
      this.logger.error(`Failed to create category: ${error.message}`, error.stack);
      throw error;
    }
  }

  async findAllCategories(): Promise<ProductCategory[]> {
    this.logger.log('Attempting to find all categories');
    try {
      const categories = await this.databaseService.productCategory.findMany();
      return categories;
    } catch (error) {
      this.logger.error(`Failed to fetch categories: ${error.message}`, error.stack);
      throw new InternalServerErrorException('Failed to fetch categories');
    }
  }

  async findCategoryById(id: number): Promise<ProductCategory> {
    this.logger.log(`Attempting to find category with id: ${id}`);
    try {
      const category = await this.databaseService.productCategory.findUnique({
        where: { id },
      });

      if (!category) {
        throw new NotFoundException('Category not found');
      }

      return category;
    } catch (error) {
      this.logger.error(`Failed to fetch category: ${error.message}`, error.stack);
      throw error;
    }
  }

  async updateCategoryById(id: number, updateCategoryDto: UpdateCategoryDto, user: User): Promise<ProductCategory> {
    this.logger.log(`Attempting to update category with id: ${id}`);
    try {
      if (user.role !== 'ADMIN') {
        throw new ForbiddenException('You are not authorized to update categories');
      }

      const existingCategory = await this.databaseService.productCategory.findUnique({
        where: { id },
      });

      if (!existingCategory) {
        throw new NotFoundException('Category not found');
      }

      const updatedCategory = await this.databaseService.productCategory.update({
        where: { id },
        data: updateCategoryDto,
      });

      this.logger.log(`Category updated successfully: ${updatedCategory.id}`);
      return updatedCategory;
    } catch (error) {
      this.logger.error(`Failed to update category: ${error.message}`, error.stack);
      throw error;
    }
  }

  async deleteCategoryById(id: number, user: User): Promise<void> {
    this.logger.log(`Attempting to delete category with id: ${id}`);
    try {
      if (user.role !== 'ADMIN') {
        throw new ForbiddenException('You are not authorized to delete categories');
      }

      const existingCategory = await this.databaseService.productCategory.findUnique({
        where: { id },
      });

      if (!existingCategory) {
        throw new NotFoundException('Category not found');
      }

      await this.databaseService.productCategory.delete({ where: { id } });
      this.logger.log(`Category deleted successfully: ${id}`);
    } catch (error) {
      this.logger.error(`Failed to delete category: ${error.message}`, error.stack);
      throw error;
    }
  }
}