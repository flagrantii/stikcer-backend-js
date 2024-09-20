import { Injectable } from '@nestjs/common';

@Injectable()
export class AppService {
  healthcheck(): { server: string; version: string } {
    return {
      server: 'ecommerce-api-nestjs',
      version: '1.0.0',
    };
  }
}
