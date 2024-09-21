import {
  Controller,
  Get,
  Post,
  Delete,
  Param,
  Body,
  UseInterceptors,
  UploadedFile,
  Res,
  HttpStatus,
  ParseIntPipe,
  Patch,
  Req,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { FilesService } from './files.service';
import { CreateFileDto } from './dto/create-file';
import { UpdateFileDto } from './dto/update-file';
import { Response } from 'express';

@Controller('files')
export class FilesController {
  constructor(private readonly filesService: FilesService) {}

  @Post('upload')
  @UseInterceptors(FileInterceptor('file'))
  async uploadFile(
    @UploadedFile() file: Express.Multer.File,
    @Body() createFileDto: CreateFileDto,
    @Req() req: Request,
    @Res() res: Response,
  ) {
    const result = await this.filesService.uploadFile(
      createFileDto,
      file,
      req['user'],
    );
    if (result.error) {
      return res.status(HttpStatus.BAD_REQUEST).json({
        success: false,
        message: result.error,
      });
    }
    return res.status(HttpStatus.CREATED).json({
      success: true,
      data: result.file,
    });
  }

  @Get('product/:id')
  async getFilesFromProductId(
    @Param('id', ParseIntPipe) id: number,
    @Res() res: Response,
  ) {
    const result = await this.filesService.getFilesFromProductId(id);
    if (result.error) {
      return res.status(HttpStatus.NOT_FOUND).json({
        success: false,
        message: result.error,
      });
    }
    return res.status(HttpStatus.OK).json({
      success: true,
      data: result.files,
    });
  }

  @Patch(':id')
  async updateFile(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateFileDto: UpdateFileDto,
    @Req() req: Request,
    @Res() res: Response,
  ) {
    const result = await this.filesService.updateFile(
      id,
      updateFileDto,
      req['user'],
    );
    if (result.error) {
      return res.status(HttpStatus.BAD_REQUEST).json({
        success: false,
        message: result.error,
      });
    }
    return res.status(HttpStatus.OK).json({
      success: true,
      data: result.file,
    });
  }

  @Delete(':id')
  async deleteFile(
    @Param('id', ParseIntPipe) id: number,
    @Req() req: Request,
    @Res() res: Response,
  ) {
    const result = await this.filesService.deleteFile(id, req['user']);
    if (result.error) {
      return res.status(HttpStatus.BAD_REQUEST).json({
        success: false,
        message: result.error,
      });
    }
    return res.status(HttpStatus.OK).json({
      success: true,
      message: 'File deleted successfully',
    });
  }
}
