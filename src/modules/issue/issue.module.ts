import { Module } from '@nestjs/common';
import { IssueCategoryService } from './issue-category.service';
import { IssueCategoryController } from './issue-category.controller';

@Module({
    imports: [],
    controllers: [IssueCategoryController],
    providers: [IssueCategoryService],
    exports: []
})
export class IssueModule { }
