import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { MongooseModule } from '@nestjs/mongoose';
import * as dotenv from 'dotenv';
import { ProductsModule } from './products/products.module';
import { ManufacturersModule } from './manufacturers/manufacturers.module';
import { VendorsModule } from './vendors/vendors.module';
import { ScheduleModule } from '@nestjs/schedule';

dotenv.config();

@Module({
  imports: [
    MongooseModule.forRoot(process.env.MONGOOSE_CONNECTION_URI),
    ProductsModule,
    ManufacturersModule,
    VendorsModule,
    ScheduleModule.forRoot(),
  ],
  controllers: [AppController],
  providers: [AppService],
})

export class AppModule {
  constructor() {
    console.log('MongoDB URI:', process.env.MONGOOSE_CONNECTION_URI); // Log the URI
  }
}
