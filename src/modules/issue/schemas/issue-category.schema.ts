import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type IssueCategoryDocument = HydratedDocument<IssueCategory>;

// 1. Define the nested Problem class
@Schema({ _id: false }) // _id is set to false to prevent Mongoose from auto-generating ObjectIds for every sub-item (remove this if you want them)
export class Problem {
  @Prop({ type: String, required: true })
  name: string;

  @Prop({ type: String, default: '' })
  description?: string;
}

// Create the schema for the nested class
const ProblemSchema = SchemaFactory.createForClass(Problem);

// 2. Update the main IssueCategory class
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

  // 3. Implement the new problem array using the nested schema
  @Prop({ type: [ProblemSchema], default: [] })
  problem: Problem[];
}

export const IssueCategorySchema = SchemaFactory.createForClass(IssueCategory);