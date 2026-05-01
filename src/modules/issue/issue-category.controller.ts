import { Controller } from "@nestjs/common";
import { IssueCategoryService } from "./issue-category.service";

@Controller()
export class IssueCategoryController{
    constructor(private readonly issueCateGoryService:IssueCategoryService){
        
    }
}