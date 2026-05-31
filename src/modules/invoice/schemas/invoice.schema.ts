import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Schema as MongooseSchema, Types, HydratedDocument } from 'mongoose';
import { InvoiceStatus } from '@common/enum/invoice.status.enum';

export type InvoiceDocument = HydratedDocument<Invoice>;

function generateInvoiceNumber(): string {
    const prefix = 'INV';
    const randomChars = Math.random().toString(36).substring(2, 6).toUpperCase();
    const timePart = Date.now().toString().slice(-4);
    return `${prefix}-${timePart}${randomChars}`;
}

@Schema({ _id: false })
class InvoiceItem {
    @Prop({type:String , required:true , index:true })
    part_name:string;
    
    @Prop({type:Number , default:0})
    part_avg_price:number;
    
    @Prop({type:String , default:''})
    part_description:string;

    @Prop({type:MongooseSchema.Types.ObjectId,ref:'parts',default:null})
    part_id?:Types.ObjectId | string | null;
}

const InvoiceItemSchema = SchemaFactory.createForClass(InvoiceItem);

@Schema({ timestamps: true, versionKey: false })
export class Invoice {
    @Prop({ 
        type: String, 
        unique: true, 
        index: true,
        default: generateInvoiceNumber 
    })
    invoice_number: string;

    @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'Issue', required: true, index: true })
    issue_id: Types.ObjectId | string;

    @Prop({ type: [InvoiceItemSchema], default: [] })
    items: InvoiceItem[];

    @Prop({ type: Number, default: 0 })
    sub_total: number;
    
    @Prop({ type: Number, default: 0 })
    discount_amount: number;

    @Prop({type:Number,default:0})
    service_charges:number;

    @Prop({type:Number , default:0})
    visiting_charge:number;

    @Prop({type:Number , default:0})
    warranty:number;

    @Prop({ type: Date, default: null })
    warranty_start_date: Date;

    @Prop({ type: Date, default: null })
    warranty_end_date: Date;

    @Prop({type:MongooseSchema.Types.ObjectId,ref:'users',default:null})
    createdBy?:Types.ObjectId | string | null;

    @Prop({ type: Number, default: 0 })
    tax: number;

    @Prop({ type: Number, default: 0 })
    total_amount: number;

    @Prop({
        type: String,
        enum: Object.values(InvoiceStatus),
        default: InvoiceStatus.PENDING,
        index: true,
    })
    status: InvoiceStatus;

    @Prop({
        type:MongooseSchema.Types.ObjectId,
        ref:'User',
        index:true,
        default:null
    })
    assigendTo?:Types.ObjectId | string | null;

    @Prop({
        type:MongooseSchema.Types.ObjectId,
        ref:'invoices',
        default:null
    })
    prev_invoice_id?:Types.ObjectId |string | null;

    @Prop({ type: Boolean, default: false, index: true })
    isDeleted: boolean;
}

export const InvoiceSchema = SchemaFactory.createForClass(Invoice);
