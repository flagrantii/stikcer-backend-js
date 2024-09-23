import { Test, TestingModule } from '@nestjs/testing';
import { CategoriesService } from './categories.service';
import { DatabaseService } from '../database/database.service';
import { NotFoundException, ForbiddenException, InternalServerErrorException } from '@nestjs/common';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { ProductCategory, User } from '@prisma/client';
import * as uuid from 'uuid';

describe('CategoriesService', () => {
  let service: CategoriesService;

  const mockDatabaseService = {
    productCategory: {
      create: jest.fn(),
      findMany: jest.fn(),
      findUnique: jest.fn(),
      findUniqueOrThrow: jest.fn(),
      findFirst: jest.fn(),
      findFirstOrThrow: jest.fn(),
      createMany: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CategoriesService,
        {
          provide: DatabaseService,
          useValue: mockDatabaseService,
        },
      ],
    }).compile();

    service = module.get<CategoriesService>(CategoriesService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('createCategory', () => {
    it('should create a category', async () => {
      const createCategoryDto: CreateCategoryDto = { name: 'Test Category' };
      const user: User = { id: '1', role: 'ADMIN' } as User;
      const category: ProductCategory = { id: '1', name: 'Test Category', createdAt: new Date(), updatedAt: new Date() };

      mockDatabaseService.productCategory.create.mockResolvedValue(category);

      const result = await service.createCategory(createCategoryDto, user);

      expect(result).toEqual(category);
      expect(mockDatabaseService.productCategory.create).toHaveBeenCalledWith({
        data: { ...createCategoryDto, id: expect.any(String) },
      });
    });

    it('should throw ForbiddenException if user is not admin', async () => {
      const createCategoryDto: CreateCategoryDto = { name: 'Test Category' };
      const user: User = { id: '1', role: 'USER' } as User;

      await expect(service.createCategory(createCategoryDto, user)).rejects.toThrow(ForbiddenException);
    });
  });

  describe('findAllCategories', () => {
    it('should return all categories', async () => {
      const categories: ProductCategory[] = [
        { id: '1', name: 'Category 1', createdAt: new Date(), updatedAt: new Date() },
        { id: '2', name: 'Category 2', createdAt: new Date(), updatedAt: new Date() },
      ];

      mockDatabaseService.productCategory.findMany.mockResolvedValue(categories);

      const result = await service.findAllCategories();

      expect(result).toEqual(categories);
      expect(mockDatabaseService.productCategory.findMany).toHaveBeenCalled();
    });

    it('should throw InternalServerErrorException if fetching fails', async () => {
      mockDatabaseService.productCategory.findMany.mockImplementation(() => {
        throw new InternalServerErrorException('Failed to fetch categories');
      });

      await expect(service.findAllCategories()).rejects.toThrow(InternalServerErrorException);
    });
  });

  describe('findCategoryById', () => {
    it('should return a category by ID', async () => {
      const category: ProductCategory = { id: '1', name: 'Category 1', createdAt: new Date(), updatedAt: new Date() };

      mockDatabaseService.productCategory.findUnique.mockResolvedValue(category);

      const result = await service.findCategoryById('1');

      expect(result).toEqual(category);
      expect(mockDatabaseService.productCategory.findUnique).toHaveBeenCalledWith({ where: { id: '1' } });
    });

    it('should throw NotFoundException if category not found', async () => {
      mockDatabaseService.productCategory.findUnique.mockResolvedValue(null);

      await expect(service.findCategoryById('1')).rejects.toThrow(NotFoundException);
    });
  });

  describe('updateCategoryById', () => {
    it('should update a category', async () => {
      const updateCategoryDto: UpdateCategoryDto = { name: 'Updated Category' };
      const user: User = { id: '1', role: 'ADMIN' } as User;
      const existingCategory: ProductCategory = { id: '1', name: 'Category 1', createdAt: new Date(), updatedAt: new Date() };
      const updatedCategory: ProductCategory = { id: '1', name: 'Updated Category', createdAt: new Date(), updatedAt: new Date() };

      mockDatabaseService.productCategory.findUnique.mockResolvedValue(existingCategory);
      mockDatabaseService.productCategory.update.mockResolvedValue(updatedCategory);

      const result = await service.updateCategoryById('1', updateCategoryDto, user);

      expect(result).toEqual(updatedCategory);
      expect(mockDatabaseService.productCategory.update).toHaveBeenCalledWith({
        where: { id: '1' },
        data: updateCategoryDto,
      });
    });

    it('should throw NotFoundException if category not found', async () => {
      const updateCategoryDto: UpdateCategoryDto = { name: 'Updated Category' };
      const user: User = { id: '1', role: 'ADMIN' } as User;

      mockDatabaseService.productCategory.findUnique.mockResolvedValue(null);

      await expect(service.updateCategoryById('1', updateCategoryDto, user)).rejects.toThrow(NotFoundException);
    });

    it('should throw ForbiddenException if user is not admin', async () => {
      const updateCategoryDto: UpdateCategoryDto = { name: 'Updated Category' };
      const user: User = { id: '1', role: 'USER' } as User;

      await expect(service.updateCategoryById('1', updateCategoryDto, user)).rejects.toThrow(ForbiddenException);
    });
  });

  describe('deleteCategoryById', () => {
    it('should delete a category', async () => {
      const user: User = { id: '1', role: 'ADMIN' } as User;
      const existingCategory: ProductCategory = { id: '1', name: 'Category 1', createdAt: new Date(), updatedAt: new Date() };

      mockDatabaseService.productCategory.findUnique.mockResolvedValue(existingCategory);
      mockDatabaseService.productCategory.delete.mockResolvedValue(undefined);

      await service.deleteCategoryById('1', user);

      expect(mockDatabaseService.productCategory.delete).toHaveBeenCalledWith({ where: { id: '1' } });
    });

    it('should throw NotFoundException if category not found', async () => {
      const user: User = { id: '1', role: 'ADMIN' } as User;

      mockDatabaseService.productCategory.findUnique.mockResolvedValue(null);

      await expect(service.deleteCategoryById('1', user)).rejects.toThrow(NotFoundException);
    });

    it('should throw ForbiddenException if user is not admin', async () => {
      const user: User = { id: '1', role: 'USER' } as User;

      await expect(service.deleteCategoryById('1', user)).rejects.toThrow(ForbiddenException);
    });
  });
});
