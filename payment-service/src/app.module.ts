import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { HttpModule } from '@nestjs/axios';
import { PaymentModule } from './payment/payment.module';
import { PrismaService } from './prisma/prisma.service';


@Module({
imports: [ConfigModule.forRoot({ isGlobal: true }), HttpModule.register({ timeout: 5000 }), PaymentModule],
providers: [PrismaService],
})
export class AppModule {}