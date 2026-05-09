import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { Types } from 'mongoose';
import { ApiResponse } from '@common/types/api-response.type';
import { Messages } from '@common/constants/messages';
import { IssueRepository } from './repositories';
import { AssignTechnicianDto, CreateIssueDto, IssueListingDto, IssueStatusDto, UpdateIssueDto } from './dto/issue.dto';
import { IssueStatus } from '@common/enum/issue.status.enum';
import { Issue } from './schemas/issue.schema';

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
        if(body.technician_id && !body.scheduled_date){
            throw new BadRequestException('Scheduled date is required when technician is assigned!');
        }
        if(body.scheduled_date && !body.technician_id){
            throw new BadRequestException('Technician is required when scheduled date is provided!');
        }
        if(body.scheduled_date && body.technician_id ){
            body.status = IssueStatus.VISIT_SCHEDULED;
        }
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
    async getIssueDetailsForEjs(id:string){
        const issue = await this.issueRepository.getIssueDetailsForEjs(id);
        return issue
    }
    async assignToTechnician(issueId: string, body: AssignTechnicianDto) {
        const checkIssueExists = await this.issueRepository.getByField({_id:new Types.ObjectId(issueId),isDeleted:false});
        if(!checkIssueExists) throw new NotFoundException('Issue not found!');
        if(checkIssueExists.status === IssueStatus.OPEN || checkIssueExists.status === IssueStatus.ASSIGNED || checkIssueExists.status === IssueStatus.VISIT_SCHEDULED){
            const updated = await this.issueRepository.updateById({technician_id:new Types.ObjectId(body.technician_id),scheduled_date:new Date(body.scheduled_date),status:IssueStatus.VISIT_SCHEDULED},new Types.ObjectId(issueId));
            if(!updated) throw new BadRequestException(Messages.SOMETHING_WENT_WRONG);
            return { message: 'Issue assigned to technician successfully.', data: updated };
        }else{
            throw new BadRequestException('Issue is already assigned to technician!');
        }
    }
}