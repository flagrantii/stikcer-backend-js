import { Test, TestingModule } from '@nestjs/testing';
import { CategoriesController } from './categories.controller';
import { CategoriesService } from './categories.service';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { ForbiddenException, BadRequestException } from '@nestjs/common';

describe('CategoriesController', () => {
  let controller: CategoriesController;

  const mockCategoriesService = {
    findAllCategories: jest.fn(),
    findCategoryById: jest.fn(),
    createCategory: jest.fn(),
    updateCategoryById: jest.fn(),
    deleteCategoryById: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [CategoriesController],
      providers: [
        {
          provide: CategoriesService,
          useValue: mockCategoriesService,
        },
      ],
    }).compile();

    controller = module.get<CategoriesController>(CategoriesController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('should create a category', async () => {
    const createCategoryDto: CreateCategoryDto = {
      name: 'Electronics',
    };
    const req = { user: { id: '1' } };
    mockCategoriesService.createCategory.mockResolvedValue(createCategoryDto);

    expect(await controller.createCategory(createCategoryDto, req)).toBe(
      createCategoryDto,
    );
    expect(mockCategoriesService.createCategory).toHaveBeenCalledWith(
      createCategoryDto,
      req.user,
    );
  });

  it('should return 403 if user is not authorized to create a category', async () => {
    const createCategoryDto: CreateCategoryDto = {
      name: 'Electronics',
    };
    const req = { user: { id: '2', role: 'USER' } }; // Different user ID
    mockCategoriesService.createCategory.mockImplementation(() => {
      throw new ForbiddenException();
    });

    await expect(
      controller.createCategory(createCategoryDto, req),
    ).rejects.toThrow(ForbiddenException);
  });

  it('should return 400 if createCategoryDto is not valid', async () => {
    const createCategoryDto: any = {
      name: '', // Invalid name
    };
    const req = { user: { id: '1' } };
    mockCategoriesService.createCategory.mockImplementation(() => {
      throw new BadRequestException();
    });

    await expect(
      controller.createCategory(createCategoryDto, req),
    ).rejects.toThrow(BadRequestException);
  });

  it('should get all categories', async () => {
    const result = [{ id: '1' }];
    mockCategoriesService.findAllCategories.mockResolvedValue(result);

    expect(await controller.getAllCategories()).toBe(result);
    expect(mockCategoriesService.findAllCategories).toHaveBeenCalled();
  });

  it('should get a category by ID', async () => {
    const result = { id: '1' };

    mockCategoriesService.findCategoryById.mockResolvedValue(result);

    expect(await controller.getCategoryById('1')).toBe(result);
    expect(mockCategoriesService.findCategoryById).toHaveBeenCalledWith('1');
  });

  it('should update a category', async () => {
    const updateCategoryDto: UpdateCategoryDto = {
      name: 'Electronics Updated',
    };
    const req = { user: { id: '1' } };
    const result = { id: '1', ...updateCategoryDto };
    mockCategoriesService.updateCategoryById.mockResolvedValue(result);

    expect(await controller.updateCategory('1', updateCategoryDto, req)).toBe(
      result,
    );
    expect(mockCategoriesService.updateCategoryById).toHaveBeenCalledWith(
      '1',
      updateCategoryDto,
      req.user,
    );
  });

  it('should return 403 if user is not authorized to update a category', async () => {
    const updateCategoryDto: UpdateCategoryDto = {
      name: 'Electronics Updated',
    };
    const req = { user: { id: '2', role: 'USER' } }; // Different user ID
    mockCategoriesService.updateCategoryById.mockImplementation(() => {
      throw new ForbiddenException();
    });

    await expect(
      controller.updateCategory('1', updateCategoryDto, req),
    ).rejects.toThrow(ForbiddenException);
  });

  it('should delete a category', async () => {
    const req = { user: { id: '1' } };
    mockCategoriesService.deleteCategoryById.mockResolvedValue(undefined);

    expect(await controller.deleteCategory('1', req)).toBeUndefined();
    expect(mockCategoriesService.deleteCategoryById).toHaveBeenCalledWith(
      '1',
      req.user,
    );
  });

  it('should return 403 if user is not authorized to delete a category', async () => {
    const req = { user: { id: '2', role: 'USER' } }; // Different user ID
    mockCategoriesService.deleteCategoryById.mockImplementation(() => {
      throw new ForbiddenException();
    });

    await expect(controller.deleteCategory('1', req)).rejects.toThrow(
      ForbiddenException,
    );
  });
});
