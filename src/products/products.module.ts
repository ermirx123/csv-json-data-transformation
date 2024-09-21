import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ProductsService } from './products.service';
import { ProductsController } from './products.controller';
import { Product, ProductSchema } from './products.schema';
import { ManufacturersModule } from '../manufacturers/manufacturers.module';
import { VendorsModule } from '../vendors/vendors.module';
import { OpenAIModule } from '../openai/openai.module';

@Module({
    imports: [
        MongooseModule.forFeature([{ name: Product.name, schema: ProductSchema }]),
        ManufacturersModule,
        VendorsModule,
        OpenAIModule
    ],
    providers: [ProductsService],
    controllers: [ProductsController],
    exports: [ProductsService]
})

export class ProductsModule { }
