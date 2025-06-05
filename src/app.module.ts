import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { LineModule } from './line/line.module';
import { PaymentModule } from './payment/payment.module';
import { ConfigModule } from '@nestjs/config';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { PAYMENT_SERVICE_RABBITMQ } from './constant';


@Module({
  imports: [LineModule, PaymentModule, ClientsModule.register([{
    name: PAYMENT_SERVICE_RABBITMQ,
    transport: Transport.RMQ,
    options:{
      urls:["amqp://chickentaki:chickentaki@localhost:5672"],
      queue:"payment_queue",
      queueOptions:{
        durable: true,
      }
    }
  }]), ConfigModule.forRoot()],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule { }
