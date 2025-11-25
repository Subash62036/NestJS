import { IsEnum, IsOptional, IsString } from 'class-validator';
import { PaymentStatus } from '@prisma/client';
import {Test} from '@prisma/client';


export class UpdatePaymentStatusDto {
// use the same enum from Prisma (via @prisma/client)
@IsEnum(PaymentStatus)
status: PaymentStatus;


@IsOptional()
@IsString()
providerTxId?: string;
}