import { Injectable, NotFoundException, BadRequestException, InternalServerErrorException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateOrderDto } from './dto/create-order.dto';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';
import { OrderStatus } from '@prisma/client';

@Injectable()
export class OrderService {
  constructor(private prisma: PrismaService, private http: HttpService) {}

  private productBaseUrl() {
    return process.env.PRODUCT_SERVICE_URL || 'http://localhost:3001';
  }

  
  async createOrder(dto: CreateOrderDto) {
    if (!dto.items || dto.items.length === 0) throw new BadRequestException('No items provided');

     // Fetching product details from product-service
    const productPromises = dto.items.map((it) =>
      firstValueFrom(this.http.get(`${this.productBaseUrl()}/products/${it.productId}`))
        .then((r) => r.data)
        .catch(() => null),
    );
    const products = await Promise.all(productPromises);

    for (let i = 0; i < products.length; i++) {
      const p = products[i];
      if (!p) throw new NotFoundException(`Product ${dto.items[i].productId} not found`);
      if (p.stock < dto.items[i].qty) throw new BadRequestException(`Insufficient stock for product ${p.name}`);
    }

    // Build initial order data
    const orderNumber = `ORD-${Date.now()}`;
    const currency = products[0]?.currency ?? 'INR';
    let totalCents = 0;
    const itemsData = dto.items.map((it, idx) => {
      const p = products[idx];
      const unit = p.priceCents ?? Math.round((p.price || 0) * 100);
      const itemTotal = unit * it.qty;
      totalCents += itemTotal;
      return {
        productId: p.id,
        productName: p.name,
        unitPrice: unit,
        qty: it.qty,
        totalPrice: itemTotal,
      };
    });

    // Transaction: create order and items
    const created = await this.prisma.$transaction(async (tx) => {
      const order = await tx.order.create({
        data: {
          orderNumber,
          customerName: dto.customerName,
          customerEmail: dto.customerEmail,
          totalCents,
          currency,
          status: OrderStatus.PENDING,
          items: { create: itemsData },
        },
        include: { items: true },
      });
    
      return order;
    });

    // After DB create, decrement stock on product-service. If some decrement fails, attempt compensating increments.
    const compensated: Array<{ productId: number; stock: number }> = [];
    try {
      
      for (const it of dto.items) {
  
        await firstValueFrom(this.http.patch(`${this.productBaseUrl()}/products/${it.productId}/adjust-stock`, { stock: -it.qty }));
        compensated.push({ productId: it.productId, stock: it.qty });
      }
    } catch (err) {

      for (const c of compensated) {
        try {
          await firstValueFrom(
            this.http.patch(`${this.productBaseUrl()}/products/${c.productId}/adjust-stock`, { stock: c.stock }),
          );
        } catch (ignore) {}
      }
      
      await this.prisma.order.delete({ where: { id: created.id } }).catch(() => {});
      throw new InternalServerErrorException('Failed to reserve stock for order; rolled back');
    }

    return created;
  }
  
  //Find all orders with items
  async findAll() {

        return await this.prisma.order.findMany({ include: { items: true }, orderBy: { createdAt: 'desc' } });
  }
 
  //Find one order by id with items

  async findOne(id: number) {
    const o = await this.prisma.order.findUnique({ where: { id }, include: { items: true } });
    if (!o) throw new NotFoundException('Order not found');
    return o;
  }

   // update order details and items

  async updateOrder(id: number, dto: CreateOrderDto){
     const existingOrder = await this.prisma.order.findUnique({
      where:{id},
      include:{items:true}
     })

     if(!existingOrder){
      throw new NotFoundException('Order not found');
      }

        const updatedOrder = await this.prisma.$transaction(async(tx)=>{
          // Delete existing items
          await tx.orderItem.deleteMany({
            where:{orderId:id}
          });
          // Update order details
          const updated = await tx.order.update({
            where:{id}, 
            data: {
              items: {
                create: dto.items.map(it => ({
                  productId: it.productId,    
                  productName: it.productName,
                  qty: it.qty,
                  unitPrice: it.unitPrice,
                  totalPrice: it.totalPrice
                }))
              },
              customerName: dto.customerName,   
              customerEmail: dto.customerEmail
            },
            include:{items:true}
          });
          return updated;
        });

  }
  
  // update order status
  
  async updateStatus(id: number, status: OrderStatus) {
    const updated = await this.prisma.order.update({ where: { id }, data: { status } });
    return updated;
  }

   
  // Get orders by product id
  async getOrdersByProductId(productId: number){
    const orders = await this.prisma.orderItem.findMany({
       where : {productId}
    })
    return orders;
  }



}
