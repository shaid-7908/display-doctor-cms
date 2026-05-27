import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, PipelineStage, Types } from 'mongoose';
import { BaseRepository } from '@common/bases/base.repository';
import { Invoice, InvoiceDocument } from '../schemas/invoice.schema';
import { InvoiceListingDto } from '../dto/invoice.dto';
import { PaginationResponse } from '@common/types/api-response.type';

@Injectable()
export class InvoiceRepository extends BaseRepository<InvoiceDocument> {
    constructor(
        @InjectModel(Invoice.name) private readonly InvoiceModel: Model<InvoiceDocument>,
    ) {
        super(InvoiceModel);
    }

    async getAllPaginate(paginatedDto: InvoiceListingDto): Promise<PaginationResponse<InvoiceDocument>> {
        const and_clauses: any[] = [{ isDeleted: false }];

        const page = paginatedDto.page || 1;
        const limit = paginatedDto.limit || 10;
        const skip = (page - 1) * limit;

        if (paginatedDto.search) {
            const regex = new RegExp(paginatedDto.search, 'i');
            and_clauses.push({
                $or: [
                    { invoice_number: regex },
                ],
            });
        }

        if (paginatedDto.issue_id) {
            and_clauses.push({ issue_id: new Types.ObjectId(paginatedDto.issue_id) });
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
                    from: 'issues',
                    localField: 'issue_id',
                    foreignField: '_id',
                    as: 'issue',
                },
            },
            { $unwind: { path: '$issue', preserveNullAndEmptyArrays: true } },
            { $sort: { [sortField]: sortOrder } },
            { $skip: skip },
            { $limit: +limit },
        ];

        const countPipeline: PipelineStage[] = [
            { $match: conditions },
            { $count: 'total' },
        ];

        const [countResult, docs] = await Promise.all([
            this.InvoiceModel.aggregate(countPipeline, { allowDiskUse: true }).exec()
                .catch((error) => { throw new InternalServerErrorException(`Count error: ${error.message}`); }),
            this.InvoiceModel.aggregate(filterPipeline, { allowDiskUse: true }).exec()
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
}
