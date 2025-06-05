import { Body, Controller, Get, Inject, Post } from '@nestjs/common';
import { AppService } from './app.service';
import { ClientProxy } from '@nestjs/microservices';
import { PAYMENT_SERVICE_RABBITMQ } from './constant';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService,
    @Inject(PAYMENT_SERVICE_RABBITMQ) private readonly client: ClientProxy,
  ) { }

  @Get()
  getHello(): string {
    return this.appService.getHello();
  }

  @Post('/payment')
  async createPayment(@Body() payment: any) {
    try {
      // 'emit' is often fire-and-forget, but 'connect' can throw if connection fails
      await this.client.connect(); // Ensure connection is established before emitting
      this.client.emit('payment-created', payment);
      console.log('Successfully sent payment to RabbitMQ:', payment);
      return { message: 'Payment sent to Rabbitmq', payment };
    } catch (error) {
      console.error('Failed to send payment to RabbitMQ:', error);
      return { message: 'Failed to send payment to RabbitMQ', error: error.message };
    }
  }
}
