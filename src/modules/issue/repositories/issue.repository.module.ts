import { Global, Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Issue, IssueSchema } from '../schemas/issue.schema';
import { IssueCategory, IssueCategorySchema } from '../schemas/issue-category.schema';
import { IssueRepository } from './issue.repository';
import { IssueCategoryRepository } from './issue-category.repository';
import { Parts, PartsSchema } from '../schemas/parts.schema';
import { PartsRepository } from './parts.repository';

@Global()
@Module({
    imports: [
        MongooseModule.forFeatureAsync([
            {
                name: Issue.name,
                useFactory: () => {
                    const schema = IssueSchema;
                    return schema;
                }
            },
            {
                name: IssueCategory.name,
                useFactory: () => {
                    const schema = IssueCategorySchema;
                    return schema;
                }
            },{
                name:Parts.name,
                useFactory:()=>{
                    const schema = PartsSchema;
                    return schema;
                }
            }
        ])
    ],
    controllers: [],
    providers: [IssueRepository, IssueCategoryRepository , PartsRepository],
    exports: [IssueRepository, IssueCategoryRepository , PartsRepository]
})
export class IssueRepositoryModule {}
