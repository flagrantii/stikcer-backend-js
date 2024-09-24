import { Test, TestingModule } from '@nestjs/testing';
import { ProductsService } from './products.service';
import { DatabaseService } from '../database/database.service';
import {
  NotFoundException,
  ForbiddenException,
  BadRequestException,
  InternalServerErrorException,
} from '@nestjs/common';
import { Product, User, ProductCategory } from '@prisma/client';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';

describe('ProductsService', () => {
  let service: ProductsService;

  const mockDatabaseService = {
    product: {
      findUnique: jest.fn(),
      findMany: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      count: jest.fn(),
    },
    $transaction: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ProductsService,
        {
          provide: DatabaseService,
          useValue: mockDatabaseService,
        },
      ],
    }).compile();

    service = module.get<ProductsService>(ProductsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('createProduct', () => {
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
      const user: User = { id: '1', role: 'USER' } as User;
      const product = { id: '1', ...createProductDto };
      mockDatabaseService.$transaction.mockResolvedValue(product);

      const result = await service.createProduct(createProductDto, user);

      expect(result).toEqual(product);
      expect(mockDatabaseService.$transaction).toHaveBeenCalled();
    });

    it('should throw InternalServerErrorException if creation fails', async () => {
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
      const user: User = { id: '1', role: 'USER' } as User;
      mockDatabaseService.$transaction.mockRejectedValue(
        new InternalServerErrorException('Failed to create product'),
      );

      await expect(
        service.createProduct(createProductDto, user),
      ).rejects.toThrow(InternalServerErrorException);
    });
  });

  describe('findAllProducts', () => {
    it('should return all products for admin', async () => {
      const user: User = { id: '1', role: 'ADMIN' } as User;
      const products: Product[] = [
        {
          id: '1',
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
          subTotal: 200,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ];
      mockDatabaseService.$transaction.mockResolvedValue([products, 1]);

      const result = await service.findAllProducts(user, 1, 10);

      expect(result).toEqual({ products, total: 1, page: 1, total_pages: 1 });
      expect(mockDatabaseService.$transaction).toHaveBeenCalledWith(
        expect.any(Function),
      );
    });

    it('should return user-specific products for non-admin', async () => {
      const user: User = { id: '1', role: 'USER' } as User;
      const products: Product[] = [
        {
          id: '1',
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
          subTotal: 200,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ];
      mockDatabaseService.$transaction.mockResolvedValue([products, 1]);

      const result = await service.findAllProducts(user, 1, 10);

      expect(result).toEqual({ products, total: 1, page: 1, total_pages: 1 });
      expect(mockDatabaseService.$transaction).toHaveBeenCalledWith(
        expect.any(Function),
      );
    });

    it('should throw InternalServerErrorException if fetching fails', async () => {
      const user: User = { id: '1', role: 'USER' } as User;
      mockDatabaseService.$transaction.mockImplementation(() => {
        throw new InternalServerErrorException('Failed to fetch products');
      });

      await expect(service.findAllProducts(user, 1, 10)).rejects.toThrow(
        InternalServerErrorException,
      );
    });
  });

  describe('findProductById', () => {
    it('should return a product by ID', async () => {
      const user: User = { id: '1', role: 'USER' } as User;
      const product: Product = {
        id: '1',
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
        subTotal: 200,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      mockDatabaseService.product.findUnique.mockResolvedValue(product);

      const result = await service.findProductById('1', user);

      expect(result).toEqual(product);
      expect(mockDatabaseService.product.findUnique).toHaveBeenCalledWith({
        where: { id: '1' },
        include: { category: true },
      });
    });

    it('should throw NotFoundException if product not found', async () => {
      const user: User = { id: '1', role: 'USER' } as User;
      mockDatabaseService.product.findUnique.mockResolvedValue(null);

      await expect(service.findProductById('1', user)).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should throw ForbiddenException if user is not authorized', async () => {
      const user: User = { id: '2', role: 'USER' } as User;
      const product: Product = {
        id: '1',
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
        subTotal: 200,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      mockDatabaseService.product.findUnique.mockResolvedValue(product);

      await expect(service.findProductById('1', user)).rejects.toThrow(
        ForbiddenException,
      );
    });

    it('should throw InternalServerErrorException if fetching fails', async () => {
      const user: User = { id: '1', role: 'USER' } as User;
      mockDatabaseService.product.findUnique.mockImplementation(() => {
        throw new InternalServerErrorException('Failed to fetch product');
      });

      await expect(service.findProductById('1', user)).rejects.toThrow(
        InternalServerErrorException,
      );
    });
  });

  describe('updateProductById', () => {
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
      const user: User = { id: '1', role: 'USER' } as User;
      const existingProduct: Product = {
        id: '1',
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
        subTotal: 200,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      const updatedProduct: Product = {
        id: '1',
        userId: '1',
        categoryId: '1',
        ...updateProductDto,
        subTotal: 450,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      mockDatabaseService.product.findUnique.mockResolvedValue(existingProduct);
      mockDatabaseService.product.update.mockResolvedValue(updatedProduct);

      const result = await service.updateProductById(
        '1',
        updateProductDto,
        user,
      );

      expect(result).toEqual(updatedProduct);
      expect(mockDatabaseService.product.update).toHaveBeenCalledWith({
        where: { id: '1' },
        data: { ...updateProductDto, subTotal: 450 },
      });
    });

    it('should throw NotFoundException if product not found', async () => {
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
      const user: User = { id: '1', role: 'USER' } as User;
      mockDatabaseService.product.findUnique.mockResolvedValue(null);

      await expect(
        service.updateProductById('1', updateProductDto, user),
      ).rejects.toThrow(NotFoundException);
    });

    it('should throw ForbiddenException if user is not authorized', async () => {
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
      const user: User = { id: '2', role: 'USER' } as User;
      const existingProduct: Product = {
        id: '1',
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
        subTotal: 200,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      mockDatabaseService.product.findUnique.mockResolvedValue(existingProduct);

      await expect(
        service.updateProductById('1', updateProductDto, user),
      ).rejects.toThrow(ForbiddenException);
    });

    it('should throw BadRequestException if product is already purchased', async () => {
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
      const user: User = { id: '1', role: 'USER' } as User;
      const existingProduct: Product = {
        id: '1',
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
        isPurchased: true,
        subTotal: 200,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      mockDatabaseService.product.findUnique.mockResolvedValue(existingProduct);

      await expect(
        service.updateProductById('1', updateProductDto, user),
      ).rejects.toThrow(BadRequestException);
    });

    it('should throw InternalServerErrorException if updating fails', async () => {
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
      const user: User = { id: '1', role: 'USER' } as User;
      const existingProduct: Product = {
        id: '1',
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
        subTotal: 200,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      mockDatabaseService.product.findUnique.mockResolvedValue(existingProduct);
      mockDatabaseService.product.update.mockImplementation(() => {
        throw new InternalServerErrorException('Failed to update product');
      });

      await expect(
        service.updateProductById('1', updateProductDto, user),
      ).rejects.toThrow(InternalServerErrorException);
    });
  });

  describe('deleteProductById', () => {
    it('should delete a product', async () => {
      const user: User = { id: '1', role: 'USER' } as User;
      const existingProduct: Product = {
        id: '1',
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
        subTotal: 200,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      mockDatabaseService.product.findUnique.mockResolvedValue(existingProduct);
      mockDatabaseService.product.delete.mockResolvedValue(undefined);

      await service.deleteProductById('1', user);

      expect(mockDatabaseService.product.delete).toHaveBeenCalledWith({
        where: { id: '1' },
      });
    });

    it('should throw NotFoundException if product not found', async () => {
      const user: User = { id: '1', role: 'USER' } as User;
      mockDatabaseService.product.findUnique.mockResolvedValue(null);

      await expect(service.deleteProductById('1', user)).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should throw ForbiddenException if user is not authorized', async () => {
      const user: User = { id: '2', role: 'USER' } as User;
      const existingProduct: Product = {
        id: '1',
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
        subTotal: 200,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      mockDatabaseService.product.findUnique.mockResolvedValue(existingProduct);

      await expect(service.deleteProductById('1', user)).rejects.toThrow(
        ForbiddenException,
      );
    });

    it('should throw InternalServerErrorException if deleting fails', async () => {
      const user: User = { id: '1', role: 'USER' } as User;
      const existingProduct: Product = {
        id: '1',
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
        subTotal: 200,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      mockDatabaseService.product.findUnique.mockResolvedValue(existingProduct);
      mockDatabaseService.product.delete.mockImplementation(() => {
        throw new InternalServerErrorException('Failed to delete product');
      });

      await expect(service.deleteProductById('1', user)).rejects.toThrow(
        InternalServerErrorException,
      );
    });
  });

  describe('findAllProductsByUserId', () => {
    it('should return all products for a user', async () => {
      const user: User = { id: '1', role: 'ADMIN' } as User;
      const products: Product[] = [
        {
          id: '1',
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
          subTotal: 200,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ];
      mockDatabaseService.$transaction.mockResolvedValue([products, 1]);

      const result = await service.findAllProductsByUserId('1', user, 1, 10);

      expect(result).toEqual({ products, total: 1, page: 1, total_pages: 1 });
      expect(mockDatabaseService.$transaction).toHaveBeenCalledWith(
        expect.any(Function),
      );
    });

    it('should throw ForbiddenException if user is not authorized', async () => {
      const user: User = { id: '2', role: 'USER' } as User;

      await expect(
        service.findAllProductsByUserId('1', user, 1, 10),
      ).rejects.toThrow(ForbiddenException);
    });

    it('should throw InternalServerErrorException if fetching fails', async () => {
      const user: User = { id: '1', role: 'ADMIN' } as User;
      mockDatabaseService.product.findMany.mockImplementation(() => {
        throw new InternalServerErrorException('Failed to fetch products');
      });

      await expect(
        service.findAllProductsByUserId('1', user, 1, 10),
      ).rejects.toThrow(InternalServerErrorException);
    });
  });

  describe('findAllProductsByCategoryId', () => {
    it('should return all products for a category', async () => {
      const user: User = { id: '1', role: 'ADMIN' } as User;
      const category: ProductCategory = {
        id: '1',
        name: 'Category 1',
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      const products: Product[] = [
        {
          id: '1',
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
          subTotal: 200,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ];
      mockDatabaseService.$transaction.mockResolvedValue([products, 1]);

      const result = await service.findAllProductsByCategoryId(
        category.id,
        user,
        1,
        10,
      );
      console.log(result);

      expect(result).toEqual({ products, total: 1, page: 1, total_pages: 1 });
      expect(mockDatabaseService.$transaction).toHaveBeenCalledWith(
        expect.any(Function),
      );
    });

    it('should throw BadRequestException if page or limit is invalid', async () => {
      const user: User = { id: '1', role: 'ADMIN' } as User;
      const categoryId = '1';
      const page = 0;
      const limit = 0;

      await expect(
        service.findAllProductsByCategoryId(categoryId, user, page, limit),
      ).rejects.toThrow(BadRequestException);
    });

    it('should throw InternalServerErrorException if fetching fails', async () => {
      const user: User = { id: '1', role: 'ADMIN' } as User;
      const categoryId = '1';
      const page = 1;
      const limit = 10;

      mockDatabaseService.$transaction.mockImplementation(() => {
        throw new InternalServerErrorException('Failed to fetch products');
      });

      await expect(
        service.findAllProductsByCategoryId(categoryId, user, page, limit),
      ).rejects.toThrow(InternalServerErrorException);
    });
  });

  describe('findProductById', () => {
    it('should return a product by ID', async () => {
      const user: User = { id: '1', role: 'USER' } as User;
      const product: Product = {
        id: '1',
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
        subTotal: 200,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      mockDatabaseService.product.findUnique.mockResolvedValue(product);

      const result = await service.findProductById('1', user);

      expect(result).toEqual(product);
      expect(mockDatabaseService.product.findUnique).toHaveBeenCalledWith({
        where: { id: '1' },
        include: { category: true },
      });
    });

    it('should throw NotFoundException if product not found', async () => {
      const user: User = { id: '1', role: 'USER' } as User;
      mockDatabaseService.product.findUnique.mockResolvedValue(null);

      await expect(service.findProductById('1', user)).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should throw ForbiddenException if user is not authorized to access the product', async () => {
      const user: User = { id: '2', role: 'USER' } as User;
      const product: Product = {
        id: '1',
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
        subTotal: 200,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      mockDatabaseService.product.findUnique.mockResolvedValue(product);

      await expect(service.findProductById('1', user)).rejects.toThrow(
        ForbiddenException,
      );
    });

    it('should throw InternalServerErrorException if fetching fails', async () => {
      const user: User = { id: '1', role: 'USER' } as User;
      mockDatabaseService.product.findUnique.mockImplementation(() => {
        throw new InternalServerErrorException('Failed to fetch product');
      });

      await expect(service.findProductById('1', user)).rejects.toThrow(
        InternalServerErrorException,
      );
    });
  });
});
