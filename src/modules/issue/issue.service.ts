import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { Types } from 'mongoose';
import { ApiResponse } from '@common/types/api-response.type';
import { Messages } from '@common/constants/messages';
import { IssueRepository } from './repositories';
import { CreateIssueDto, IssueListingDto, IssueStatusDto, UpdateIssueDto } from './dto/issue.dto';

@Injectable()
export class IssueService {
    constructor(private readonly issueRepository: IssueRepository) { }

    async getAll(body: IssueListingDto): Promise<ApiResponse> {
        const data = await this.issueRepository.getAllPaginate(body);
        return { message: 'Issues fetched successfully.', data };
    }

    async create(body: CreateIssueDto): Promise<ApiResponse> {
        const saved = await this.issueRepository.save(body);
        if (!saved) throw new BadRequestException(saved instanceof Error ? saved.message : Messages.SOMETHING_WENT_WRONG);
        return { message: 'Issue created successfully.', data: saved };
    }

    async get(id: string): Promise<ApiResponse> {
        const issue = await this.issueRepository.getByField({ _id: new Types.ObjectId(id), isDeleted: false });
        if (!issue) throw new NotFoundException('Issue not found!');
        return { message: 'Issue retrieved successfully.', data: issue };
    }

    async update(id: string, body: UpdateIssueDto): Promise<ApiResponse> {
        const issue = await this.issueRepository.getByField({ _id: new Types.ObjectId(id), isDeleted: false });
        if (!issue) throw new NotFoundException('Issue not found!');

        const updated = await this.issueRepository.updateById(body, new Types.ObjectId(id));
        if (!updated) throw new BadRequestException(Messages.SOMETHING_WENT_WRONG);
        return { message: 'Issue updated successfully.', data: updated };
    }

    async statusChange(id: string, body: IssueStatusDto): Promise<ApiResponse> {
        const issue = await this.issueRepository.getByField({ _id: new Types.ObjectId(id), isDeleted: false });
        if (!issue) throw new NotFoundException('Issue not found!');

        const updated = await this.issueRepository.updateById({ status: body.status }, new Types.ObjectId(id));
        if (!updated) throw new BadRequestException(Messages.SOMETHING_WENT_WRONG);
        return { message: 'Issue status updated successfully.', data: updated };
    }

    async delete(id: string): Promise<ApiResponse> {
        const issue = await this.issueRepository.getByField({ _id: new Types.ObjectId(id), isDeleted: false });
        if (!issue) throw new NotFoundException('Issue not found!');

        const deleted = await this.issueRepository.updateById({ isDeleted: true }, id);
        if (!deleted) throw new BadRequestException(Messages.SOMETHING_WENT_WRONG);
        return { message: 'Issue deleted successfully.' };
    }
}