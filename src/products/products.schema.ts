import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { v4 as uuidv4 } from 'uuid';
import { Document, Types } from 'mongoose';

export type ProductDocument = Product & Document;

@Schema()
export class Image {
    @Prop()
    fileName: string;

    @Prop()
    cdnLink?: string;

    @Prop()
    i?: number;

    @Prop()
    alt?: string;
}

interface Attributes {
    packaging?: string | null; // Allow null for packaging
    description?: string | null; // Allow null for description
}

@Schema()
export class Variant {
    @Prop({ required: true })
    id: string;

    @Prop()
    available: boolean;

    @Prop({ type: Object }) // Define attributes as an object
    attributes?: Attributes | null; // Allow attributes to be null

    @Prop()
    cost: number;

    @Prop()
    currency: string;

    @Prop()
    description?: string;

    @Prop()
    dimensionUom?: string | null;

    @Prop()
    height: number | null;

    @Prop()
    width: number | null;

    @Prop()
    manufacturerItemCode: string;

    @Prop()
    manufacturerItemId: string;

    @Prop()
    packaging: string;

    @Prop({ required: true })
    price: number;

    @Prop()
    optionName: string;

    @Prop()
    optionsPath: string;

    @Prop()
    optionItemsPath: string;

    @Prop()
    sku: string;

    @Prop({ required: true })
    active: boolean;

    @Prop({ type: [Image] })
    images: Image[];

    @Prop()
    itemCode: string;
}

@Schema()
export class OptionValue {
    @Prop()
    id: string;

    @Prop()
    name: string;

    @Prop()
    value: string;
}

@Schema()
export class Option {

    @Prop()
    name: string;

    @Prop()
    id: string;

    @Prop({ type: [OptionValue] })
    values: OptionValue[];

    @Prop({ type: Object }) 
    dataField: Object | null;
}

@Schema()
export class Product {

    @Prop({ required: true })
    doc_id: string;

    @Prop()
    name: string;

    @Prop()
    type: string;

    @Prop()
    shortDescription?: string;

    @Prop()
    description?: string;

    @Prop()
    productId: string;

    @Prop()
    vendorId: string;

    @Prop()
    manufacturerId: string;

    // In case we want to join data of vendors and manufacturors we must save ObjectId instead of uuid

    // @Prop({ type: Types.ObjectId, ref: 'Vendor', required: true }) // Reference to Vendor
    // vendorId: Types.ObjectId;

    // @Prop({ type: Types.ObjectId, ref: 'Manufacturer', required: true }) // Reference to Manufacturer
    // manufacturerId: Types.ObjectId;

    @Prop({ required: true })
    storefrontPriceVisibility: string;

    @Prop({ type: [Variant] })
    variants: Variant[];

    @Prop({ type: [Option] })
    options: Option[];

    @Prop()
    availability: string;

    @Prop({ default: false })
    isFragile: boolean;

    @Prop()
    published: string;

    @Prop()
    isTaxable: boolean;

    @Prop({ type: [Image] })
    images: Image[];

    @Prop()
    categoryId: string;

    @Prop()
    createdBy?: string;

    @Prop()
    createdAt?: Date;

    @Prop()
    updatedBy?: string;

    @Prop()
    updatedAt?: Date;

    @Prop()
    deletedBy?: string;

    @Prop()
    deletedAt?: Date;

    @Prop()
    dataSource: string;

    @Prop()
    companyStatus: string;

    @Prop()
    transactionId?: string;

    @Prop()
    skipEvent?: boolean;

    @Prop()
    userRequestId?: string;
}

export const ProductSchema = SchemaFactory.createForClass(Product);
