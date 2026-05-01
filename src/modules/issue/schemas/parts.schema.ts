import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import {Schema as MongooseSchema , Types ,HydratedDocument} from 'mongoose';

export type PartsDocument = HydratedDocument<Parts>;

@Schema({timestamps:true ,versionKey:false})
export class Parts {
    @Prop({type:String , required:true , index:true })
    part_name:string;
    
    @Prop({type:Number , default:0})
    part_avg_price:number;
    
    @Prop({type:String , default:''})
    part_description:string;
    
    @Prop({type:Boolean , default:false , index:true})
    isDeleted:boolean;

    @Prop({type:MongooseSchema.Types.ObjectId , ref:'issuecategories'})
    category_id:Types.ObjectId | string;
}

export const PartsSchema = SchemaFactory.createForClass(Parts);