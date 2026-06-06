import { Prop, Schema } from "@nestjs/mongoose";

@Schema({ timestamps: true, versionKey: false })
export class Settings {
    @Prop({ type: String, default: '' })
    siteLogo: string;

    @Prop({ type: String, default: '' })
    invoiceAddress: string;
    
    @Prop({ type: Boolean, default: false })
    isDeleted: boolean;
}