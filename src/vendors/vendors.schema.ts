import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import { v4 as uuidv4 } from 'uuid';

export type VendorDocument = Vendor & Document;

@Schema()
export class Vendor {

    @Prop({ default: uuidv4, unique: true })
    doc_id: string;

    @Prop()
    manufacturerId: string;

    @Prop()
    name: string;
}

export const VendorSchema = SchemaFactory.createForClass(Vendor);
