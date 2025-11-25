import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { map, Observable } from 'rxjs';

@Injectable()
export class OrderTransformInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    return next.handle().pipe(
      map((data) => {
         if (Array.isArray(data)) {
          return data.map((order) => this.transformOrder(order));
        }
      
        return this.transformOrder(data);
      }),
    );
  }

  private transformOrder(order: any) {
    if (!order) return order;

    return {
      id: order.id,
      orderNumber: order.orderNumber,
      customerName: order.customerName,
      customerEmail: order.customerEmail,
      status: order.status,
      currency: order.currency,
      totalAmount: (order.totalCents || 0) / 100,
      items: order.items?.map((item) => ({
        productId: item.productId,
        productName: item.productName,
        qty: item.qty,
        unitPrice: item.unitPrice,
        totalPrice: item.totalPrice,
      })),
      createdAt: order.createdAt,
      updatedAt: order.updatedAt,
    };
  }
}
