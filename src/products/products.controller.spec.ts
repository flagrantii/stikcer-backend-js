import { Test, TestingModule } from '@nestjs/testing';
import { ProductsController } from './products.controller';
import { ProductsService } from './products.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { ForbiddenException, BadRequestException } from '@nestjs/common';

describe('ProductsController', () => {
  let controller: ProductsController;

  const mockProductsService = {
    findAllProducts: jest.fn(),
    findProductById: jest.fn(),
    createProduct: jest.fn(),
    updateProductById: jest.fn(),
    deleteProductById: jest.fn(),
    findAllProductsByCategoryId: jest.fn(),
    findAllProductsByUserId: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ProductsController],
      providers: [
        {
          provide: ProductsService,
          useValue: mockProductsService,
        },
      ],
    }).compile();

    controller = module.get<ProductsController>(ProductsController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('should create a product', async () => {
    const createProductDto: CreateProductDto = {
      productId: '1',
      userId: '1',
      categoryId: '1',
      size: 'M',
      material: 'Cotton',
      shape: 'Round',
      printingSide: 'Front',
      parcelColor: ['Red'],
      inkColor: ['Black'],
      unitPrice: 100,
      amount: 2,
      note: 'Test note',
      isPurchased: false,
    };
    const req = { user: { id: '1' } };
    mockProductsService.createProduct.mockResolvedValue(createProductDto);

    expect(await controller.createProduct(createProductDto, req)).toBe(
      createProductDto,
    );
    expect(mockProductsService.createProduct).toHaveBeenCalledWith(
      createProductDto,
      req.user,
    );
  });

  it('should get all products with pagination', async () => {
    const req = { user: { id: '1' } };
    const page = 1;
    const limit = 10;
    const result = {
      products: [{ id: '1', name: 'Product 1' }],
      total: 1,
      page: 1,
      total_pages: 1,
    };
    mockProductsService.findAllProducts.mockResolvedValue(result);

    expect(await controller.getAllProducts(page, limit, req)).toBe(result);
    expect(mockProductsService.findAllProducts).toHaveBeenCalledWith(
      req.user,
      page,
      limit,
    );
  });

  it('should get a product by ID', async () => {
    const req = { user: { id: '1' } };
    const result = { id: '1', name: 'Product 1' };
    mockProductsService.findProductById.mockResolvedValue(result);

    expect(await controller.getProductById('1', req)).toBe(result);
    expect(mockProductsService.findProductById).toHaveBeenCalledWith(
      '1',
      req.user,
    );
  });

  it('should update a product', async () => {
    const updateProductDto: UpdateProductDto = {
      size: 'L',
      material: 'Polyester',
      shape: 'Square',
      printingSide: 'Back',
      parcelColor: ['Blue'],
      inkColor: ['White'],
      isPurchased: true,
      amount: 3,
      unitPrice: 150,
      note: 'Updated note',
    };
    const req = { user: { id: '1' } };
    const result = { id: '1', ...updateProductDto };
    mockProductsService.updateProductById.mockResolvedValue(result);

    expect(await controller.updateProduct('1', updateProductDto, req)).toBe(
      result,
    );
    expect(mockProductsService.updateProductById).toHaveBeenCalledWith(
      '1',
      updateProductDto,
      req.user,
    );
  });

  it('should delete a product', async () => {
    const req = { user: { id: '1' } };
    mockProductsService.deleteProductById.mockResolvedValue(undefined);

    expect(await controller.deleteProduct('1', req)).toBeUndefined();
    expect(mockProductsService.deleteProductById).toHaveBeenCalledWith(
      '1',
      req.user,
    );
  });

  it('should get products by category ID with pagination', async () => {
    const req = { user: { id: '1' } };
    const categoryId = '1';
    const page = 1;
    const limit = 10;
    const result = {
      products: [{ id: '1', name: 'Product 1', categoryId: '1' }],
      total: 1,
      page: 1,
      total_pages: 1,
    };
    mockProductsService.findAllProductsByCategoryId.mockResolvedValue(result);

    expect(
      await controller.getProductsByCategoryId(categoryId, page, limit, req),
    ).toBe(result);
    expect(
      mockProductsService.findAllProductsByCategoryId,
    ).toHaveBeenCalledWith(categoryId, req.user, page, limit);
  });

  it('should get products by user ID with pagination', async () => {
    const req = { user: { id: '1', role: 'ADMIN' } };
    const userId = '1';
    const page = 1;
    const limit = 10;
    const result = {
      products: [{ id: '1', name: 'Product 1', userId: '1' }],
      total: 1,
      page: 1,
      total_pages: 1,
    };
    mockProductsService.findAllProductsByUserId.mockResolvedValue(result);

    expect(await controller.getProductsByUserId(userId, page, limit, req)).toBe(
      result,
    );
    expect(mockProductsService.findAllProductsByUserId).toHaveBeenCalledWith(
      userId,
      req.user,
      page,
      limit,
    );
  });

  it('should return 403 if user is not authorized to get products by user ID', async () => {
    const req = { user: { id: '2', role: 'USER' } };
    const userId = '1';
    const page = 1;
    const limit = 10;
    mockProductsService.findAllProductsByUserId.mockImplementation(() => {
      throw new ForbiddenException();
    });

    await expect(
      controller.getProductsByUserId(userId, page, limit, req),
    ).rejects.toThrow(ForbiddenException);
  });

  it('should return 400 if page or limit is invalid', async () => {
    const req = { user: { id: '1' } };
    const page = 0;
    const limit = 0;
    mockProductsService.findAllProducts.mockImplementation(() => {
      throw new BadRequestException('Invalid page or limit value');
    });

    await expect(controller.getAllProducts(page, limit, req)).rejects.toThrow(
      BadRequestException,
    );
  });
});
