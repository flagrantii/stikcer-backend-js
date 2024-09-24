import {
  MiddlewareConsumer,
  Module,
  NestModule,
  RequestMethod,
  ValidationPipe,
} from '@nestjs/common';
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
import { FilesService } from './files/files.service';
import { FilesModule } from './files/files.module';
import { AuthMiddleware } from './middleware/authenticated';
import { S3Module } from './s3/s3.module';
import { ScheduleModule } from '@nestjs/schedule';
import { PaymentService } from './payment/payment.service';
import { PaymentModule } from './payment/payment.module';
import { ThrottlerModule } from '@nestjs/throttler';
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
    S3Module,
    PaymentModule,
    ScheduleModule.forRoot(),
    ThrottlerModule.forRoot({
      throttlers: [
        {
          ttl: 60,
          limit: 100,
        },
      ],
    }),
  ],
  controllers: [AppController],
  providers: [
    AppService,
    AuthMiddleware,
    {
      provide: APP_PIPE,
      useClass: ValidationPipe,
    },
    FilesService,
    PaymentService,
  ],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(AuthMiddleware)
      .exclude(
        { path: 'auth/signin', method: RequestMethod.POST },
        { path: 'auth/signup', method: RequestMethod.POST },
      )
      .forRoutes('*');

    consumer
      .apply(AuthorizeAdmin)
      .forRoutes({ path: 'users', method: RequestMethod.GET });

    // Remove AuthorizeUser middleware from here
  }
}
