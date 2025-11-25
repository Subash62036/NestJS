import { IsInt, IsNotEmpty, IsString, Min } from 'class-validator';


export class CreatePaymentDto {
@IsInt()
orderId: number;

@IsInt()
@Min(1)
amountCents: number;

@IsString()
@IsNotEmpty()
currency: string;

@IsString()
@IsNotEmpty()
paymentMethod: string; // e.g., CARD, UPI, WALLET (for simulation)

}