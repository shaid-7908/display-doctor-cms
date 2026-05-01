import { IssueStatus } from '@common/enum/issue.status.enum';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Schema as MongooseSchema, Types, HydratedDocument } from 'mongoose';

export type IssueDocument = HydratedDocument<Issue>;



@Schema({ timestamps: true, versionKey: false })
export class Issue {
    @Prop({ type: String, required: true, unique: true, index: true })
    ticket_number: string;

    // Customer info (stored inline + FK reference for flexibility)
    // @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'User', index: true })
    // customer_id: Types.ObjectId;

    @Prop({ type: String, default: '', index: true })
    customer_name: string;

    @Prop({ type: String, default: '', index: true })
    customer_email: string;

    @Prop({ type: String, default: '' })
    customer_phone: string;

    @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'IssueCategory', index: true })
    category_id: Types.ObjectId;

    @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'User', default: null, index: true })
    technician_id: Types.ObjectId | null;

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
    scheduled_date: Date | null;

    @Prop({ type: String, default: null })
    resolution_notes: string | null;

    @Prop({ type: Boolean, default: false, index: true })
    isDeleted: boolean;
}

export const IssueSchema = SchemaFactory.createForClass(Issue);
