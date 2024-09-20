import { Controller, Get } from '@nestjs/common';
import { AppService } from './app.service';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  healthcheck(): { server: string; version: string } {
    return {
      server: 'ecommerce-api-nestjs',
      version: '1.0.0',
    };
  }
}
