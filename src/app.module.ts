import { MiddlewareConsumer, Module, NestModule, RequestMethod, ValidationPipe } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { DatabaseModule } from './database/database.module';
import { UsersModule } from './users/users.module';
import { ProductsModule } from './products/products.module';
import { OrdersModule } from './orders/orders.module';
import { AuthModule } from './auth/auth.module';
import { APP_PIPE } from '@nestjs/core';
import { AuthorizeAdmin } from './middleware/authorizeAdmin';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule } from '@nestjs/config';
import { CategoriesModule } from './categories/categories.module';
import { AuthorizeUser } from './middleware/authorizeUser';
import { FilesService } from './files/files.service';
import { FilesController } from './files/files.controller';
import { FilesModule } from './files/files.module';
import { AuthMiddleware } from './middleware/authenticated';

@Module({
  imports: [
    ConfigModule.forRoot(), 
    DatabaseModule, 
    AuthModule,
    JwtModule,
    UsersModule, 
    ProductsModule, 
    OrdersModule, 
    CategoriesModule,
    FilesModule,
  ],
  controllers: [AppController, FilesController],
  providers: [
    AppService,
    AuthMiddleware,
    {
      provide: APP_PIPE,
      useClass: ValidationPipe
    },
    FilesService
  ],
})

export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(AuthMiddleware)
      .exclude(
        { path: 'auth/signin', method: RequestMethod.POST },
        { path: 'auth/signup', method: RequestMethod.POST }
      )
      .forRoutes('*');

    consumer
      .apply(AuthorizeAdmin)
      .forRoutes(
        { path: 'users', method: RequestMethod.GET },
        { path: 'users/:id', method: RequestMethod.ALL },
        { path: 'categories', method: RequestMethod.POST },
        { path: 'categories/:id', method: RequestMethod.PATCH },
        { path: 'categories/:id', method: RequestMethod.DELETE },
        { path: 'products', method: RequestMethod.POST },
        { path: 'products/:id', method: RequestMethod.PATCH },
        { path: 'products/:id', method: RequestMethod.DELETE }
      );

    consumer
      .apply(AuthorizeUser)
      .forRoutes(
        { path: 'users/me', method: RequestMethod.ALL },
        { path: 'users/me/address', method: RequestMethod.ALL },
        { path: 'orders', method: RequestMethod.POST }
      );
  }
}