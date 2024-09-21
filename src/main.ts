import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import * as cookieParser from 'cookie-parser';
import helmet from 'helmet';
import { ConfigService } from '@nestjs/config';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const configService = app.get(ConfigService);

  // middleware
  app.use(cookieParser());
  app.use(helmet());

  // listen on port 3000 and set global prefix
  app.setGlobalPrefix('api/v1');
  await app.listen(configService.get('PORT'));
}
bootstrap();
