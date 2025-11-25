import { Controller, Post, Body, Get, Param, Patch, HttpException, HttpStatus, UseGuards, UseInterceptors } from '@nestjs/common';
import { OrderService } from './order.service';
import { CreateOrderDto } from './dto/create-order.dto';
import { UpdateOrderStatusDto } from './dto/update-order-status.dto';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import{ ApiKeyGuard } from '../comman/guard/api-key.guard';
import{ OrderTransformInterceptor } from '../comman/interceptors/order-transform.interceptor';
import{OrderValidationPipe} from './pipes/order-validation.pipe';

@ApiTags('orders')
@UseGuards(ApiKeyGuard)
@UseInterceptors(OrderTransformInterceptor)
@Controller('orders')
export class OrderController {
  constructor(private readonly svc: OrderService) {}

  @Post()
  @ApiOperation({ summary: 'Create an order' })
  @ApiResponse({ status: 201 })
  async create(@Body(OrderValidationPipe) dto: CreateOrderDto) {
    try {
      return await this.svc.createOrder(dto);
    } catch (err) {
      throw new HttpException(err.message || 'Bad Request', HttpStatus.BAD_REQUEST);
    }
  }

  @Get()
  @ApiOperation({ summary: 'Get all orders' })
  async findAll() {
    return this.svc.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get order by id' })
  async findOne(@Param('id') id: string) {
    return this.svc.findOne(+id);
  }

  @Patch(':id')
  @ApiOperation({summary: 'Update an order'})
  async updateOrder(@Param('id') id: string, @Body() dto: CreateOrderDto){
    try{
      return await this.svc.updateOrder(+id, dto);

    }catch(err){
      throw new HttpException(err.message || 'Bad Request', HttpStatus.BAD_REQUEST);
    }

  }


  @Patch(':id/status')
  @ApiOperation({ summary: 'Update order status' })
  async updateStatus(@Param('id') id: string, @Body() dto: UpdateOrderStatusDto) {
    return this.svc.updateStatus(+id, dto.status);
  }


  // Can get order by product id

  @Get(':id/product')
  @ApiOperation({ summary : 'Get orders by product id' })
  async getOrdersByProductId(@Param('id') productId: string){
    return this.svc.getOrdersByProductId(+productId);
    
  }
}
