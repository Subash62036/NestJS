import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';


@Injectable()
export class ProductService {
    constructor(private prisma: PrismaService) { }


    async create(dto: CreateProductDto) {
        const sku = `SKU-${Date.now()}`;
        return await this.prisma.product.create({ data: { ...dto, sku } });
    }


    findAll() {
        return this.prisma.product.findMany();
    }


    async findOne(id: number) {
        const p = await this.prisma.product.findUnique({ where: { id } });
        if (!p) throw new NotFoundException('Product not found');
        return p;
    }


    async update(id: number, dto: UpdateProductDto) {
        await this.findOne(id);
        return await this.prisma.product.update({ where: { id }, data: dto });
    }


    async remove(id: number) {
        await this.findOne(id);
        return await this.prisma.product.delete({ where: { id } });
    }


    async adjustStock(id: number, stock: number) {
        const product = await this.findOne(id);

        console.log("Product",product)
        const newStock = product.stock + stock;
        if (newStock < 0) {
            throw new BadRequestException('Insufficient stock');
        }
        
        return await this.prisma.product.update({ where: { id }, data: { stock: newStock } });
     
    }

}