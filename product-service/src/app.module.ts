import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ProductModule } from './product/product.module';
import { PrismaService } from './prisma/prisma.service';
import{ LoggerMiddleware } from './comman/middleware/logger.middleware';


@Module({
imports: [ConfigModule.forRoot({ isGlobal: true }), ProductModule],
providers: [PrismaService]
})
export class AppModule implements NestModule{
    configure(consumer: MiddlewareConsumer) {
        consumer.apply(LoggerMiddleware).forRoutes('*');
    }
}