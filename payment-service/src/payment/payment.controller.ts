import { Body, Controller, Get, Param, Patch, Post, HttpException, HttpStatus } from '@nestjs/common';
import { PaymentService } from './payment.service';
import { CreatePaymentDto } from './dto/create-payment.dto';
import { UpdatePaymentStatusDto } from './dto/update-payment-status.dto';


@Controller('payments')
export class PaymentController {
constructor(private readonly svc: PaymentService) {}


@Post()
async createPayment(@Body() dto: CreatePaymentDto) {
try {
return await this.svc.createPayment(dto);
} catch (err) {
throw new HttpException(err.message || 'Bad Request', HttpStatus.BAD_REQUEST);
}
}


@Get(':id')
async getPayment(@Param('id') id: string) {
return this.svc.getPayment(+id);
}


@Patch(':id/status')
async updateStatus(@Param('id') id: string, @Body() dto: UpdatePaymentStatusDto) {
return this.svc.updateStatus(+id, dto);
}


// Simulated webhook endpoint (payment gateway would call this)
@Post(':id/webhook/simulate-success')
async simulateSuccess(@Param('id') id: string) {
return this.svc.simulateProviderCallback(+id, true);
}


@Post(':id/webhook/simulate-failure')
async simulateFailure(@Param('id') id: string) {
return this.svc.simulateProviderCallback(+id, false);
}
}