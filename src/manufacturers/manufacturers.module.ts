import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ManufacturersService } from './manufacturers.service';
import { ManufacturersController } from './manufacturers.controller';
import { ManufacturerSchema, Manufacturer } from './manufacturers.schema';

@Module({
    imports: [
        MongooseModule.forFeature([{ name: Manufacturer.name, schema: ManufacturerSchema }]),
    ],
    providers: [ManufacturersService],
    controllers: [ManufacturersController],
    exports: [ManufacturersService], 
})

export class ManufacturersModule { }
