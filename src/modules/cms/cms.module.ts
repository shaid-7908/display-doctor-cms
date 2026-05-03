import { Module } from '@nestjs/common';
import { CmsController } from './cms.controller';
import { CmsService } from './cms.service';
import { CmsEjsController } from './cms.ejs.controller';
import { IssueModule } from '../issue/issue.module';

@Module({
    imports: [IssueModule],
    controllers: [CmsController, CmsEjsController],
    providers: [CmsService],
    exports: [CmsService]
})
export class CmsModule { }
