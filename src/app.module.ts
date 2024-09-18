import { MiddlewareConsumer, Module, NestModule, RequestMethod, ValidationPipe } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { DatabaseModule } from './database/database.module';
import { UsersModule } from './users/users.module';
import { ProductsModule } from './products/products.module';
import { OrdersModule } from './orders/orders.module';
import { AuthModule } from './auth/auth.module';
import { Authenticated } from './middleware/authenticated';
import { APP_PIPE } from '@nestjs/core';
import { AuthorizeAdmin } from './middleware/authorizeAdmin';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule } from '@nestjs/config';
import { CategoriesModule } from './categories/categories.module';
import { AuthorizeUser } from './middleware/authorizeUser';
import { FilesService } from './files/files.service';
import { FilesController } from './files/files.controller';
import { FilesModule } from './files/files.module';

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
    Authenticated,
    AuthorizeAdmin,
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
    .apply(Authenticated)
    .forRoutes(
      //Auth
      { path: "auth/logout", method: RequestMethod.POST },

      //products
      { path: "products", method: RequestMethod.POST },
      { path: "products", method: RequestMethod.GET },
      { path: "products/:productId", method: RequestMethod.GET },
      { path: "products/:productId", method: RequestMethod.PATCH },
      { path: "products/:productId", method: RequestMethod.DELETE },
      { path: "products/category/:categoryId", method: RequestMethod.GET },

      //orders
      { path : "orders", method: RequestMethod.GET },
      { path : "orders", method: RequestMethod.POST },
      { path : "orders/:orderId", method: RequestMethod.GET },
      { path : "orders/:orderId", method: RequestMethod.DELETE },

      //files
      { path : "files", method: RequestMethod.POST },
      { path : "files/:fileId", method: RequestMethod.GET },
      { path : "files/:fileId", method: RequestMethod.PATCH },
      { path : "files/:fileId", method: RequestMethod.DELETE },
      { path : "files/product/:productId", method: RequestMethod.GET },

    )
    .apply(AuthorizeAdmin)
    .forRoutes(
      // users
    
      { path : "users/:userId", method: RequestMethod.GET },
      { path : "users/:userId", method: RequestMethod.PATCH },
      { path : "users/:userId", method: RequestMethod.DELETE },
      { path : "users/:userId/address", method: RequestMethod.GET },
      { path : "users/:userId/address", method: RequestMethod.POST },
      { path : "users/:userId/address/:addressId", method: RequestMethod.GET },
      { path : "users/:userId/address/:addressId", method: RequestMethod.PATCH },
      { path : "users/:userId/address/:addressId", method: RequestMethod.DELETE },

      // products
      { path: "products/user/:userId", method: RequestMethod.GET },

      // orders
      { path : "orders/user/:userId", method: RequestMethod.GET },
      { path : "orders/:orderId", method: RequestMethod.PATCH },

      // categories
      { path : "categories", method: RequestMethod.POST },
      { path : "categories/:categoryId", method: RequestMethod.PATCH },
      { path : "categories/:categoryId", method: RequestMethod.DELETE },

    )
    .apply(AuthorizeUser)
    .forRoutes(
      // users
      { path : "users/me", method: RequestMethod.GET },
      { path : "users/me", method: RequestMethod.PATCH },
      { path : "users/me/address", method: RequestMethod.POST },
      { path : "users/me/address", method: RequestMethod.GET },
      { path : "users/me/address/:addressId", method: RequestMethod.GET },
      { path : "users/me/address/:addressId", method: RequestMethod.PATCH },
      { path : "users/me/address/:addressId", method: RequestMethod.DELETE },

    )
  }
}