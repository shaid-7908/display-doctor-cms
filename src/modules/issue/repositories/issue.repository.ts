import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, PipelineStage, Types } from 'mongoose';
import { BaseRepository } from '@common/bases/base.repository';
import { Issue, IssueDocument } from '../schemas/issue.schema';
import { IssueListingDto } from '../dto/issue.dto';
import { PaginationResponse } from '@common/types/api-response.type';

@Injectable()
export class IssueRepository extends BaseRepository<IssueDocument> {
    constructor(
        @InjectModel(Issue.name) private readonly IssueModel: Model<IssueDocument>,
    ) {
        super(IssueModel);
    }

    async getAllPaginate(paginatedDto: IssueListingDto): Promise<PaginationResponse<IssueDocument>> {
        const and_clauses: any[] = [{ isDeleted: false }];

        const page = paginatedDto.page || 1;
        const limit = paginatedDto.limit || 10;
        const skip = (page - 1) * limit;

        if (paginatedDto.search) {
            const regex = new RegExp(paginatedDto.search, 'i');
            and_clauses.push({
                $or: [
                    { customer_name: regex },
                    { customer_phone: regex },
                    { ticket_number: regex },
                ],
            });
        }

        if (paginatedDto.category_id) {
            and_clauses.push({ category_id: new Types.ObjectId(paginatedDto.category_id) });
        }

        if (paginatedDto.technician_id) {
            and_clauses.push({ technician_id: new Types.ObjectId(paginatedDto.technician_id) });
        }

        if (paginatedDto.status) {
            and_clauses.push({ status: paginatedDto.status });
        }

        const conditions = { $and: and_clauses };

        const sortField = paginatedDto.sortField || 'createdAt';
        const sortOrder = paginatedDto.sortOrder === 'asc' ? 1 : -1;

        const filterPipeline: PipelineStage[] = [
            { $match: conditions },
            {
                $lookup: {
                    from: 'issuecategories',
                    localField: 'category_id',
                    foreignField: '_id',
                    as: 'category',
                },
            },
            { $unwind: { path: '$category', preserveNullAndEmptyArrays: true } },
            {
                $lookup: {
                    from: 'users',
                    localField: 'technician_id',
                    foreignField: '_id',
                    as: 'technician',
                },
            },
            { $unwind: { path: '$technician', preserveNullAndEmptyArrays: true } },
            { $sort: { [sortField]: sortOrder } },
            { $skip: skip },
            { $limit: +limit },
            {
                $project: {
                    ticket_number: 1,
                    customer_name: 1,
                    customer_email: 1,
                    customer_phone: 1,
                    customer_address: 1,
                    customer_pincode: 1,
                    category_id: 1,
                    'category.name': 1,
                    technician_id: 1,
                    'technician.name': 1,
                    status: 1,
                    issue_description: 1,
                    scheduled_date: 1,
                    resolution_notes: 1,
                    createdAt: 1,
                },
            },
        ];

        const countPipeline: PipelineStage[] = [
            { $match: conditions },
            { $count: 'total' },
        ];

        const [countResult, docs] = await Promise.all([
            this.IssueModel.aggregate(countPipeline, { allowDiskUse: true }).exec()
                .catch((error) => { throw new InternalServerErrorException(`Count error: ${error.message}`); }),
            this.IssueModel.aggregate(filterPipeline, { allowDiskUse: true }).exec()
                .catch((error) => { throw new InternalServerErrorException(`Data error: ${error.message}`); }),
        ]);

        const totalDocs = countResult.length ? countResult[0].total : 0;
        const remainingDocs = totalDocs - (skip + docs.length);
        const hasNextPage = remainingDocs > 0;
        const hasPrevPage = page > 1;

        return {
            meta: {
                totalDocs,
                skip,
                page,
                limit,
                hasPrevPage,
                hasNextPage,
                prevPage: hasPrevPage ? page - 1 : null,
                nextPage: hasNextPage ? page + 1 : null,
            },
            docs,
        };
    }


    async getIssueDetailsForEjs(id:string){
        const pipeline:PipelineStage[] = [
            { $match: {_id: new Types.ObjectId(id), isDeleted: false}},
            {
                $lookup: {
                    from: 'issuecategories',
                    localField: 'category_id',
                    foreignField: '_id',
                    as: 'category',
                },
            },
            { $unwind: { path: '$category', preserveNullAndEmptyArrays: true } },
            {
                $lookup: {
                    from: 'users',
                    localField: 'technician_id',
                    foreignField: '_id',
                    as: 'technician',
                },
            },
            { $unwind: { path: '$technician', preserveNullAndEmptyArrays: true } },
            {
                $project: {
                    ticket_number: 1,
                    customer_name: 1,
                    customer_email: 1,
                    customer_phone: 1,
                    customer_address: 1,
                    customer_pincode: 1,
                    category_id: 1,
                    'category.name': 1,
                    technician_id: 1,
                    // technician:1,
                    'technician.fullName': 1,
                    'technician.phone': 1,
                    'technician.email':1,
                    status: 1,
                    issue_description: 1,
                    scheduled_date: 1,
                    resolution_notes: 1,
                    createdAt: 1,
                },
            },
        ];
        const data = await this.IssueModel.aggregate(pipeline).exec();
        if(!data) return null;
        return data[0];
    }
}
