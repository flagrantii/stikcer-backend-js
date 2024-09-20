import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Req,
  Res,
} from '@nestjs/common';
import { ProductsService } from './products.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { Request, Response } from 'express';

@Controller('products')
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  @Post()
  async CreateProduct(
    @Res() res: Response,
    @Req() req: Request,
    @Body() createProductDto: CreateProductDto,
  ) {
    const { product, err } = await this.productsService.InsertProduct(
      createProductDto,
      req['user'],
    );
    if (err !== null) {
      return res.status(500).json({
        success: false,
        message: err,
      });
    }

    return res.status(201).json({
      success: true,
      data: product,
    });
  }

  @Get()
  async GetAllProducts(@Res() res: Response, @Req() req: Request) {
    const { products, err } = await this.productsService.FindAllProducts(
      req['user'],
    );
    if (err !== null) {
      return res.status(500).json({
        success: false,
        message: err,
      });
    }

    return res.status(200).json({
      success: true,
      amount: products.length,
      data: products,
    });
  }

  @Get('category/:categoryId')
  async FindAllProductsByCategoryId(
    @Res() res: Response,
    @Param('categoryId') categoryId: string,
    @Req() req: Request,
  ) {
    const { products, err } =
      await this.productsService.FindAllProductsByCategoryId(
        +categoryId,
        req['user'],
      );
    if (err !== null) {
      return res.status(500).json({
        success: false,
        message: err,
      });
    }

    return res.status(200).json({
      success: true,
      data: products,
    });
  }

  @Get('user/:userId')
  async FindAllProductsByUserId(
    @Res() res: Response,
    @Param('userId') userId: string,
    @Req() req: Request,
  ) {
    const { products, err } =
      await this.productsService.FindAllProductsByUserId(+userId, req['user']);
    if (err !== null) {
      return res.status(500).json({
        success: false,
        message: err,
      });
    }

    return res.status(200).json({
      success: true,
      data: products,
    });
  }

  @Get(':id')
  async FindProductById(
    @Res() res: Response,
    @Param('id') id: string,
    @Req() req: Request,
  ) {
    const { product, err } = await this.productsService.FindProductById(
      +id,
      req['user'],
    );
    if (err !== null) {
      let statusCode: number;
      switch (err) {
        case 'not found this product':
          statusCode = 404;
          break;
        default:
          statusCode = 500;
      }

      return res.status(statusCode).json({
        success: false,
        message: err,
      });
    }

    return res.status(200).json({
      success: true,
      data: product,
    });
  }

  @Patch(':id')
  async UpdateProductById(
    @Res() res: Response,
    @Param('id') id: string,
    @Body() updateProductDto: UpdateProductDto,
    @Req() req: Request,
  ) {
    const { product, err } = await this.productsService.UpdateProductById(
      +id,
      updateProductDto,
      req['user'],
    );
    if (err !== null) {
      let statusCode: number;
      switch (err) {
        case 'not found this product':
          statusCode = 404;
          break;
        default:
          statusCode = 500;
      }

      return res.status(statusCode).json({
        success: false,
        message: err,
      });
    }

    return res.status(200).json({
      success: true,
      data: product,
    });
  }

  @Delete(':id')
  async DeleteProductById(
    @Res() res: Response,
    @Param('id') id: string,
    @Req() req: Request,
  ) {
    const { err } = await this.productsService.DeleteProductById(
      +id,
      req['user'],
    );
    if (err !== null) {
      let statusCode: number;
      switch (err) {
        case 'not found this product':
          statusCode = 404;
          break;
        default:
          statusCode = 500;
      }

      return res.status(statusCode).json({
        success: false,
        message: err,
      });
    }

    return res.status(200).json({
      success: true,
      data: {},
    });
  }
}
