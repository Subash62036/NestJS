import { Module, NestModule, MiddlewareConsumer} from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { HttpModule } from '@nestjs/axios';
import { OrderModule } from './order/order.module';
import { PrismaService } from './prisma/prisma.service';
import { LoggerMiddleware } from './comman/middleware/logger.middleware';


@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    HttpModule.register({ timeout: 5000, maxRedirects: 5 }),
    OrderModule,
  ],
  providers: [PrismaService],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(LoggerMiddleware).forRoutes('*');
  }
}