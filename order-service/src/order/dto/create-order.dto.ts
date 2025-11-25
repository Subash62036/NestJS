import { IsInt, Min, IsOptional, IsString, IsEmail, IsArray, ValidateNested, isNotEmpty, IsNotEmpty, IsNumber } from 'class-validator';
import { Type } from 'class-transformer';


export class CreateOrderItemDto {
  @IsInt()
  @IsNotEmpty()
  productId: number;

  @IsInt()
  @Min(1)
  @IsNotEmpty()
  qty: number;

  @IsNumber()
  @IsNotEmpty()
  unitPrice: number;

  @IsNumber()
  @IsNotEmpty()
  totalPrice: number;
   
  @IsString()
  productName: string;

}

export class CreateOrderDto {
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  customerName?: string;

  @IsOptional()
  @IsEmail()
  @IsNotEmpty()
  customerEmail?: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateOrderItemDto)
  items: CreateOrderItemDto[];
}
