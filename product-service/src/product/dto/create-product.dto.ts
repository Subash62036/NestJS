import { IsNotEmpty, IsOptional, IsString, IsInt, Min } from 'class-validator';


export class CreateProductDto {
    
@IsString()
@IsNotEmpty()
sku: string;

@IsString()
@IsNotEmpty()
name: string;


@IsOptional()
@IsString()
description?: string;


@IsInt()
@Min(0)
priceCents: number;


@IsOptional()
@IsString()
currency?: string = 'INR';


@IsInt()
stock: number = 0;
}