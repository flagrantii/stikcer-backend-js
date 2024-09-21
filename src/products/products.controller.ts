import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Request,
  HttpStatus,
  HttpCode,
} from '@nestjs/common';
import { ProductsService } from './products.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { RolesGuard } from 'src/auth/guards/roles.guard';
import { Roles } from 'src/auth/decorators/roles.decorator';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiParam, ApiBody } from '@nestjs/swagger';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';

@ApiTags('products')
@Controller('products')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new product' })
  @ApiResponse({ status: 201, description: 'The product has been successfully created.' })
  @ApiBody({ type: CreateProductDto })
  async createProduct(@Body() createProductDto: CreateProductDto, @Request() req) {
    return this.productsService.createProduct(createProductDto, req.user);
  }

  @Get()
  @ApiOperation({ summary: 'Get all products' })
  @ApiResponse({ status: 200, description: 'Returns all products.' })
  async getAllProducts(@Request() req) {
    return this.productsService.findAllProducts(req.user);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a product by ID' })
  @ApiResponse({ status: 200, description: 'Returns the product.' })
  @ApiParam({ name: 'id', type: 'string' })
  async getProductById(@Param('id') id: string, @Request() req) {
    return this.productsService.findProductById(+id, req.user);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a product' })
  @ApiResponse({ status: 200, description: 'The product has been successfully updated.' })
  @ApiParam({ name: 'id', type: 'string' })
  @ApiBody({ type: UpdateProductDto })
  async updateProduct(@Param('id') id: string, @Body() updateProductDto: UpdateProductDto, @Request() req) {
    return this.productsService.updateProductById(+id, updateProductDto, req.user);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a product' })
  @ApiResponse({ status: 204, description: 'The product has been successfully deleted.' })
  @ApiParam({ name: 'id', type: 'string' })
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteProduct(@Param('id') id: string, @Request() req) {
    await this.productsService.deleteProductById(+id, req.user);
  }

  @Get('category/:categoryId')
  @ApiOperation({ summary: 'Get products by category ID' })
  @ApiResponse({ status: 200, description: 'Returns products in the specified category.' })
  @ApiParam({ name: 'categoryId', type: 'string' })
  async getProductsByCategoryId(@Param('categoryId') categoryId: string, @Request() req) {
    return this.productsService.findAllProductsByCategoryId(+categoryId, req.user);
  }

  @Get('user/:userId')
  @Roles('ADMIN')
  @ApiOperation({ summary: 'Get products by user ID' })
  @ApiResponse({ status: 200, description: 'Returns products created by the specified user.' })
  @ApiParam({ name: 'userId', type: 'string' })
  async getProductsByUserId(@Param('userId') userId: string, @Request() req) {
    return this.productsService.findAllProductsByUserId(+userId, req.user);
  }
}
