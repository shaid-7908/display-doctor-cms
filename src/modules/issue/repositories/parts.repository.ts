import { BaseRepository } from "@common/bases/base.repository";
import { Injectable } from "@nestjs/common";
import { Parts, PartsDocument } from "../schemas/parts.schema";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";

@Injectable()
export class PartsRepository extends BaseRepository<PartsDocument>{
 constructor(@InjectModel(Parts.name) private readonly partsModel:Model<PartsDocument>){
    super(partsModel);
 }


}