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
  UseInterceptors,
  UploadedFile,
  Query,
} from '@nestjs/common';
import { FilesService } from './files.service';
import { CreateFileDto } from '../files/dto/create-file';
import { UpdateFileDto } from '../files/dto/update-file';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiParam,
  ApiBody,
  ApiConsumes,
} from '@nestjs/swagger';
import { FileInterceptor } from '@nestjs/platform-express';

@ApiTags('files')
@Controller('files')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
export class FilesController {
  constructor(private readonly filesService: FilesService) {}

  @Post('upload')
  @UseInterceptors(FileInterceptor('file'))
  @ApiOperation({ summary: 'Upload a new file' })
  @ApiResponse({
    status: 201,
    description: 'The file has been successfully uploaded.',
  })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: {
          type: 'string',
          format: 'binary',
        },
        productId: {
          type: 'number',
        },
        categoryId: {
          type: 'number',
        },
      },
    },
  })
  async uploadFile(
    @UploadedFile() file: Express.Multer.File,
    @Body() createFileDto: CreateFileDto,
    @Request() req,
  ) {
    return this.filesService.uploadFile(createFileDto, file, req.user);
  }

  @Get('product/:productId')
  @ApiOperation({ summary: 'Get files by product ID' })
  @ApiResponse({
    status: 200,
    description: 'Returns files for the specified product.',
  })
  @ApiParam({ name: 'productId', type: 'string' })
  async getFilesByProductId(
    @Param('productId') productId: string,
    @Request() req,
  ) {
    return this.filesService.getFilesFromProductId(+productId, req.user);
  }

  @Get('blockprint')
  @ApiOperation({ summary: 'Get all blockprint files' })
  @ApiResponse({
    status: 200,
    description: 'Returns all blockprint files.',
  })
  @ApiParam({ name: 'userId', type: 'string' })
  @ApiParam({ name: 'categoryId', type: 'string' })
  async getBlockprintFiles(
    @Query('userId') userId: string,
    @Query('categoryId') categoryId: string,
    @Request() req,
  ) {
    return this.filesService.getFilesFromUserIdandCategoryId(
      +userId,
      +categoryId,
      req.user,
    );
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a file' })
  @ApiResponse({
    status: 200,
    description: 'The file has been successfully updated.',
  })
  @ApiParam({ name: 'id', type: 'string' })
  @ApiBody({ type: UpdateFileDto })
  async updateFile(
    @Param('id') id: string,
    @Body() updateFileDto: UpdateFileDto,
    @Request() req,
  ) {
    return this.filesService.updateFile(+id, updateFileDto, req.user);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a file' })
  @ApiResponse({
    status: 204,
    description: 'The file has been successfully deleted.',
  })
  @ApiParam({ name: 'id', type: 'string' })
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteFile(@Param('id') id: string, @Request() req) {
    await this.filesService.deleteFile(+id, req.user);
  }
}
