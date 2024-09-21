import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { v4 as uuidv4 } from 'uuid';
import axios from 'axios';
import { Manufacturer } from './manufacturers.schema';
import * as fs from 'fs';
import * as csv from 'csv-parser';

@Injectable()
export class ManufacturersService {
    constructor(@InjectModel(Manufacturer.name) private manufacturerModel: Model<Manufacturer>) { }

    async getById(manufacturerId: string): Promise<Manufacturer> {
        const manufacturer = await this.manufacturerModel.findOne({ manufacturerId }).exec();
        if (!manufacturer) {
            throw new NotFoundException(`Manufacturer with ID ${manufacturerId} not found`);
        }
        return manufacturer;
    }
    
    async handleReturnManufacturer(manufacturerData) {
        const { ManufacturerID, ManufacturerCode, ManufacturerName } = manufacturerData;
    
        let manufacturer = await this.manufacturerModel.findOne({ code: ManufacturerCode });
        if (!manufacturer) {
            manufacturer = new this.manufacturerModel({
                doc_id: uuidv4(),
                id: ManufacturerID,
                code: ManufacturerCode,
                name: ManufacturerName
            });
            await manufacturer.save();
        }
        return manufacturer ? manufacturer.doc_id : null;
    }

    async create(manufacturer: Manufacturer): Promise<Manufacturer> {
        const newManufacturer = new this.manufacturerModel(manufacturer);
        return newManufacturer.save();
    }

}
