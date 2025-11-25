import { HttpService } from '@nestjs/axios';
import { Injectable, NotFoundException, BadRequestException, InternalServerErrorException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreatePaymentDto } from './dto/create-payment.dto';
import { UpdatePaymentStatusDto } from './dto/update-payment-status.dto';
import { firstValueFrom } from 'rxjs';
import { PaymentStatus } from '@prisma/client';






@Injectable()
export class PaymentService {
    constructor(private prisma: PrismaService, private http: HttpService) { }


    private orderUrl() {
        return process.env.ORDER_SERVICE_URL || 'http://localhost:3002/api/orders';
    }


    // Create a payment record and optionally call external provider (simulated)
    async createPayment(dto: CreatePaymentDto) {
        // verify order exists and is in PENDING state
        try {
            const orderResp = await firstValueFrom(this.http.get(`${this.orderUrl()}/${dto.orderId}`));
            const order = orderResp.data;
            if (!order) throw new NotFoundException('Order not found');
            // optional: check order.status === 'PENDING'
        } catch (err) {
            throw new NotFoundException('Order not found or cannot reach order service');
        }


        const paymentId = `PAY-${Date.now()}`;
        const p = await this.prisma.payment.create({
            data: {
                paymentId,
                orderId: dto.orderId,
                amountCents: dto.amountCents,
                currency: dto.currency,
                status: PaymentStatus.PROCESSING,
                metadata: { method: dto.paymentMethod },
            },
        });


        // Simulate calling payment provider asynchronously (fire-and-forget)
        this.simulateProvider(p.id);


        return p;
        const updated = await this.prisma.payment.update({ where: { id }, data: { status: dto.status, providerTxId: dto.providerTxId || null } });
        return updated;
    }


    async getPayment(id: number) {
        const p = await this.prisma.payment.findUnique({ where: { id } });
        if (!p) throw new NotFoundException('Payment not found');
        return p;
    }

    async updateStatus(id: number, dto: UpdatePaymentStatusDto) {
        const p = await this.prisma.payment.findUnique({ where: { id } });
        if (!p) throw new NotFoundException('Payment not found');
        const updated = await this.prisma.payment.update({ where: { id }, data: { status: dto.status, providerTxId: dto.providerTxId || null } });
        return updated;
    }

    // Simulated async call to payment provider
    private async simulateProvider(paymentRecordId: number) {
        // In real scenario, call payment gateway API here
        setTimeout(async () => {
            // Randomly decide success or failure
            const isSuccess = Math.random() < 0.8; // 80% success rate
            await this.simulateProviderCallback(paymentRecordId, isSuccess);
        }, 3000); // 3 seconds delay
    }   
    // Simulated callback from payment provider
    async simulateProviderCallback(paymentRecordId: number, isSuccess: boolean) {
        const p = await this.prisma.payment.findUnique({ where: { id: paymentRecordId } });
        if (!p) throw new NotFoundException('Payment not found');
        const newStatus = isSuccess ? PaymentStatus.COMPLETED : PaymentStatus.FAILED;
        const updated = await this.prisma.payment.update({ where: { id: paymentRecordId }, data: { status: newStatus, providerTxId: `PROV-TX-${Date.now()}` } });
        return updated;
    }


}