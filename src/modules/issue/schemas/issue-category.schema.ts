import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type IssueCategoryDocument = HydratedDocument<IssueCategory>;

@Schema({ timestamps: true, versionKey: false })
export class IssueCategory {
    @Prop({ type: String, default: '', index: true })
    name: string;

    @Prop({ type: String, default: '' })
    description: string;

    @Prop({ type: String, default: 'Active', enum: ['Active', 'Inactive'], index: true })
    status: 'Active' | 'Inactive';

    @Prop({ type: Boolean, default: false, index: true })
    isDeleted: boolean;
}

export const IssueCategorySchema = SchemaFactory.createForClass(IssueCategory);
