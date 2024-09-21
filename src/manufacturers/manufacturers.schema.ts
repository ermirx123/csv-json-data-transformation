import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import { v4 as uuidv4 } from 'uuid';

export type ManufacturerDocument = Manufacturer & Document;

@Schema()
export class Manufacturer {

    @Prop({ default: uuidv4, unique: true })
    doc_id: string;

    @Prop()
    id: string;

    @Prop()
    code: string;

    @Prop()
    name: string;
}

export const ManufacturerSchema = SchemaFactory.createForClass(Manufacturer);
