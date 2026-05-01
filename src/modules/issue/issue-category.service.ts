import { Injectable } from "@nestjs/common";
import { IssueCategoryRepository } from "./repositories/issue-category.repository";

@Injectable()
export class IssueCategoryService {
    constructor(private readonly issueCateGoryRepo:IssueCategoryRepository){}
}