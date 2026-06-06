import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { HydratedDocument } from 'mongoose';

export type SettingsDocument = HydratedDocument<Settings>;

@Schema({ timestamps: true, versionKey: false })
export class Settings {
    @Prop({ type: String, default: '' })
    siteLogo: string;

    @Prop({ type: String, default: '' })
    invoiceAddress: string;
    
    @Prop({ type: Boolean, default: false })
    isDeleted: boolean;
}

export const SettingsSchema = SchemaFactory.createForClass(Settings);