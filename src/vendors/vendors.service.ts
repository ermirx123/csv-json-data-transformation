import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Vendor } from './vendors.schema';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class VendorsService {
    constructor(@InjectModel(Vendor.name) private vendorModel: Model<Vendor>) { }

    async create(vendor: Vendor): Promise<Vendor> {
        const newVendor = new this.vendorModel(vendor);
        return newVendor.save();
    }

    async handleReturnVendor(manufacturerData) {
        const { ManufacturerName, ManufacturerID, ManufacturerCode } = manufacturerData;
        
        let vendor = await this.vendorModel.findOne({ name: ManufacturerName });
        if (!vendor) {
            vendor = new this.vendorModel({
                doc_id: uuidv4(),
                manufacturerId: ManufacturerID,
                name: ManufacturerName
            });
            await vendor.save();
        }
        return vendor ? vendor.doc_id : null;
    }

    async getVendorById(vendorId: string): Promise<Vendor> {
        const vendor = await this.vendorModel.findOne({ id: vendorId }).exec();
        if (!vendor) throw new NotFoundException(`Vendor with ID ${vendorId} not found`);
        return vendor;
    }

}
