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
import { CartsModule } from './carts/carts.module';
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
    CategoriesModule, CartsModule, FilesModule,
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
          // users
          { path: "users/address", method: RequestMethod.POST },
          { path: "users/me", method: RequestMethod.GET },
          { path: "users/:id", method: RequestMethod.PATCH },
          { path: "users/:id", method: RequestMethod.DELETE },
          { path: "users/address/:id", method: RequestMethod.PATCH },
          { path: "users/address/:id", method: RequestMethod.DELETE },

          // orders
          { path: "orders", method: RequestMethod.GET },
          { path: "orders/:id", method: RequestMethod.GET },
          { path: "orders/:id", method: RequestMethod.DELETE },

          // carts
          { path: "carts", method: RequestMethod.GET },
          { path: "carts/:productId", method: RequestMethod.GET },
          { path: "carts/:productId", method: RequestMethod.PATCH },
          { path: "carts/:productId", method: RequestMethod.DELETE },
          
        )
        .apply(Authenticated, AuthorizeAdmin)
        .forRoutes(
          // users
          { path: "users", method: RequestMethod.GET },

          // products
          { path: "products", method: RequestMethod.POST },
          { path: "products/:id", method: RequestMethod.PATCH },
          { path: "products/:id", method: RequestMethod.DELETE },

          // categories
          { path: "categories", method: RequestMethod.POST },
          { path: "categories/:id", method: RequestMethod.PATCH },
          { path: "categories/:id", method: RequestMethod.DELETE },

        )
        .apply(Authenticated, AuthorizeUser)
        .forRoutes(
          // orders
          { path: "orders", method: RequestMethod.POST },

          // carts
          { path: "carts", method: RequestMethod.POST },

        )
  }
}