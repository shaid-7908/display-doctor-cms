import { BaseRepository } from '@common/bases/base.repository';
import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, PipelineStage, Types } from 'mongoose';
import { Parts, PartsDocument } from '../schemas/parts.schema';
import { PartsListingDto } from '../dto/parts.category';
import { PaginationResponse } from '@common/types/api-response.type';

@Injectable()
export class PartsRepository extends BaseRepository<PartsDocument> {
    constructor(
        @InjectModel(Parts.name) private readonly partsModel: Model<PartsDocument>
    ) {
        super(partsModel);
    }

    async getAllPaginate(paginatedDto: PartsListingDto): Promise<PaginationResponse<PartsDocument>> {
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
                    { part_name: searchRegex },
                    { part_description: searchRegex }
                ]
            });
        }

        if (paginatedDto.category_id) {
            and_clauses.push({ category_id: new Types.ObjectId(paginatedDto.category_id) });
        }

        const sortField = paginatedDto.sortField || '_id';
        const sortOrder = paginatedDto.sortOrder === 'asc' ? 1 : -1;

        conditions['$and'] = and_clauses;

        const filterPipeline: PipelineStage[] = [
            { $match: conditions },
            {
                $lookup: {
                    from: 'issuecategories',
                    localField: 'category_id',
                    foreignField: '_id',
                    as: 'category'
                }
            },
            { $unwind: { path: '$category', preserveNullAndEmptyArrays: true } },
            { $skip: skip },
            { $limit: +limit },
            {
                $project: {
                    part_name: 1,
                    part_avg_price: 1,
                    part_description: 1,
                    category_id: 1,
                    'category.name': 1,
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
            this.partsModel.aggregate(countPipeline, { allowDiskUse: true }).exec()
                .catch((error) => {
                    throw new InternalServerErrorException(`Error during count aggregation: ${error.message}`);
                }),
            this.partsModel.aggregate(filterPipeline, { allowDiskUse: true }).exec()
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