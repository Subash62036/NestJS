import { 
  PipeTransform, 
  Injectable, 
  BadRequestException 
} from '@nestjs/common';
import { OrderStatus } from '@prisma/client';

@Injectable()
export class OrderValidationPipe implements PipeTransform {
  transform(value: any) {
    if (!value || typeof value !== 'object') {
      throw new BadRequestException('Invalid request body');
    }

    // Validate & normalize base fields
    this.validateCustomerFields(value);
    this.validateStatusField(value);
    this.validateItemsArray(value);

    return value;  // Return transformed & validated DTO
  }

  // ----------------------
  // CUSTOMER VALIDATION
  // ----------------------
  private validateCustomerFields(dto: any) {
    if (!dto.customerName || dto.customerName.trim().length === 0) {
      throw new BadRequestException('customerName is required');
    }

    if (!dto.customerEmail || !this.isEmail(dto.customerEmail)) {
      throw new BadRequestException('Invalid or missing customerEmail');
    }

    // Normalize
    dto.customerName = dto.customerName.trim();
    dto.customerEmail = dto.customerEmail.trim().toLowerCase();
  }

  private isEmail(email: string) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  }

  // ----------------------
  // ORDER STATUS VALIDATION
  // ----------------------
  private validateStatusField(dto: any) {
    if (dto.status) {
      const status = String(dto.status).toUpperCase();
      const allowed = Object.values(OrderStatus);

      if (!allowed.includes(status as OrderStatus)) {
        throw new BadRequestException(
          `Invalid status: ${dto.status}. Allowed values: ${allowed.join(', ')}`
        );
      }

      dto.status = status;
    }
  }

  // ----------------------
  // ITEMS ARRAY VALIDATION
  // ----------------------
  private validateItemsArray(dto: any) {
    if (!Array.isArray(dto.items) || dto.items.length === 0) {
      throw new BadRequestException('items must be a non-empty array');
    }

    dto.items.forEach((item, index) => {
      if (!item.productId || item.productId <= 0) {
        throw new BadRequestException(`Item ${index + 1}: Invalid productId`);
      }

      if (!item.qty || item.qty <= 0) {
        throw new BadRequestException(`Item ${index + 1}: qty must be greater than 0`);
      }

      if (item.unitPrice < 0) {
        throw new BadRequestException(`Item ${index + 1}: unitPrice must be >= 0`);
      }

      if (item.totalPrice < 0) {
        throw new BadRequestException(`Item ${index + 1}: totalPrice must be >= 0`);
      }
    });
  }
}
