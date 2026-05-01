import { Module } from '@nestjs/common';
import { IssueCategoryService } from './issue-category.service';
import { IssueCategoryController } from './issue-category.controller';
import { PartsService } from './parts.service';
import { PartsController } from './parts.controller';
import { IssueService } from './issue.service';
import { IssueController } from './issue.controller';

@Module({
    imports: [],
    controllers: [IssueCategoryController, PartsController, IssueController],
    providers: [IssueCategoryService, PartsService, IssueService],
    exports: []
})
export class IssueModule { }
