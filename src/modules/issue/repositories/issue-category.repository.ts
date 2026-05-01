import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { BaseRepository } from '@common/bases/base.repository';
import { IssueCategory, IssueCategoryDocument } from '../schemas/issue-category.schema';

@Injectable()
export class IssueCategoryRepository extends BaseRepository<IssueCategoryDocument> {
    constructor(
        @InjectModel(IssueCategory.name) private readonly IssueCategoryModel: Model<IssueCategoryDocument>,
    ) {
        super(IssueCategoryModel);
    }
}
