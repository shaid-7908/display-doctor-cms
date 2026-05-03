import { IssueStatus } from '@common/enum/issue.status.enum';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Schema as MongooseSchema, Types, HydratedDocument } from 'mongoose';

export type IssueDocument = HydratedDocument<Issue>;


function generateTicketNumber(): string {
    const prefix = 'TKT';
    // Use a mix of the current time and random characters for uniqueness
    const randomChars = Math.random().toString(36).substring(2, 6).toUpperCase();
    const timePart = Date.now().toString().slice(-4);
    return `${prefix}-${timePart}${randomChars}`;
}


@Schema({ timestamps: true, versionKey: false })
export class Issue {
    @Prop({ 
        type: String, 
        unique: true, 
        index: true,
        default: generateTicketNumber  // Use the function to generate default value
    })
    ticket_number: string;

    // Customer info (stored inline + FK reference for flexibility)
    // @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'User', index: true })
    // customer_id: Types.ObjectId;

    @Prop({ type: String, default: '', index: true })
    customer_name: string;

    @Prop({ type: String, default: '', index: true })
    customer_email: string;

    @Prop({ type: String, default: '',index:true })
    customer_phone: string;

    @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'IssueCategory', index: true })
    category_id: Types.ObjectId | string;

    @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'User', default: null, index: true })
    technician_id: Types.ObjectId | null | string;

    @Prop({
        type: String,
        enum: Object.values(IssueStatus),
        default: IssueStatus.OPEN,
        index: true,
    })
    status: IssueStatus;

    @Prop({ type: String, default: '' })
    issue_description: string;

    @Prop({ type: Date, default: null })
    scheduled_date: Date | null | string;

    @Prop({ type: String, default: null })
    resolution_notes: string | null;

    @Prop({ type: Boolean, default: false, index: true })
    isDeleted: boolean;
}

export const IssueSchema = SchemaFactory.createForClass(Issue);
