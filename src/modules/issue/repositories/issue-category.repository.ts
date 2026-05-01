import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, PipelineStage } from 'mongoose';
import { BaseRepository } from '@common/bases/base.repository';
import { IssueCategory, IssueCategoryDocument } from '../schemas/issue-category.schema';
import { IssueCategoryListingDto } from '../dto/issue-category.dto';
import { PaginationResponse } from '@common/types/api-response.type';
import { InternalServerErrorException } from '@nestjs/common';

@Injectable()
export class IssueCategoryRepository extends BaseRepository<IssueCategoryDocument> {
    constructor(
        @InjectModel(IssueCategory.name) private readonly IssueCategoryModel: Model<IssueCategoryDocument>,
    ) {
        super(IssueCategoryModel);
    }

    async getAllPaginate(paginatedDto: IssueCategoryListingDto): Promise<PaginationResponse<IssueCategoryDocument>> {
        const conditions: any = {};
        const and_clauses: any[] = [];

        const page = paginatedDto.page || 1;
        const limit = paginatedDto.limit || 10;
        const skip = (page - 1) * limit;

        and_clauses.push({ isDeleted: false });

        if (paginatedDto.search) {
            const searchRegex = new RegExp(paginatedDto.search, 'i');
            and_clauses.push({
                $or: [
                    { name: searchRegex },
                    { description: searchRegex }
                ]
            });
        }

        if (paginatedDto.status) {
            and_clauses.push({ status: paginatedDto.status });
        }

        const sortField = paginatedDto.sortField || '_id';
        const sortOrder = paginatedDto.sortOrder === 'asc' ? 1 : -1;

        conditions['$and'] = and_clauses;

        const filterPipeline: PipelineStage[] = [
            { $match: conditions },
            { $skip: skip },
            { $limit: +limit },
            {
                $project: {
                    name: 1,
                    description: 1,
                    status: 1,
                    problem: 1,
                    createdAt: 1
                }
            },
            { $sort: { [sortField]: sortOrder } }
        ];

        const countPipeline: PipelineStage[] = [
            { $match: conditions },
            { $count: 'total' }
        ];

        const [countResult, aggregate] = await Promise.all([
            this.IssueCategoryModel.aggregate(countPipeline, { allowDiskUse: true }).exec()
                .catch((error) => {
                    throw new InternalServerErrorException(`Error during count aggregation: ${error.message}`);
                }),
            this.IssueCategoryModel.aggregate(filterPipeline, { allowDiskUse: true }).exec()
                .catch((error) => {
                    throw new InternalServerErrorException(`Error during data aggregation: ${error.message}`);
                })
        ]);

        const totalDocs = countResult.length ? countResult[0].total : 0;
        const hasMoreDocs = totalDocs > 0;
        const remainingDocs = totalDocs - (skip + aggregate.length);
        const hasNextPage = hasMoreDocs && remainingDocs > 0;
        const hasPrevPage = page != 1;

        return {
            meta: {
                totalDocs,
                skip,
                page,
                limit,
                hasPrevPage,
                hasNextPage,
                prevPage: hasPrevPage ? page - 1 : null,
                nextPage: hasNextPage ? page + 1 : null
            },
            docs: aggregate
        };
    }
}
