import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { BaseRepository } from '@common/bases/base.repository';
import { Issue, IssueDocument } from '../schemas/issue.schema';

@Injectable()
export class IssueRepository extends BaseRepository<IssueDocument> {
    constructor(
        @InjectModel(Issue.name) private readonly IssueModel: Model<IssueDocument>,
    ) {
        super(IssueModel);
    }
}
