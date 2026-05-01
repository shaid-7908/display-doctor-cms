import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { Types } from 'mongoose';
import { ApiResponse } from '@common/types/api-response.type';
import { Messages } from '@common/constants/messages';
import { IssueCategoryRepository } from './repositories/issue-category.repository';
import {
    IssueCategoryListingDto,
    SaveIssueCategoryDto,
    StatusIssueCategoryDto,
    UpdateIssueCategoryDto
} from './dto/issue-category.dto';

@Injectable()
export class IssueCategoryService {
    constructor(private readonly issueCateGoryRepo: IssueCategoryRepository) { }

    async getAll(body: IssueCategoryListingDto): Promise<ApiResponse> {
        const data = await this.issueCateGoryRepo.getAllPaginate(body);
        return { message: 'Issue categories fetched successfully.', data };
    }

    async save(body: SaveIssueCategoryDto): Promise<ApiResponse> {
        const existing = await this.issueCateGoryRepo.getByField({ name: body.name, isDeleted: false });
        if (existing) throw new BadRequestException('Issue category with this name already exists!');

        const saved = await this.issueCateGoryRepo.save(body);
        if (!saved) throw new BadRequestException(saved instanceof Error ? saved.message : Messages.SOMETHING_WENT_WRONG);

        return { message: 'Issue category saved successfully.', data: saved };
    }

    async get(id: string): Promise<ApiResponse> {
        const category = await this.issueCateGoryRepo.getByField({ _id: new Types.ObjectId(id), isDeleted: false });
        if (!category) throw new NotFoundException('Issue category not found!');
        return { message: 'Issue category retrieved successfully.', data: category };
    }

    async update(id: string, body: UpdateIssueCategoryDto): Promise<ApiResponse> {
        if (body.name) {
            const existing = await this.issueCateGoryRepo.getByField({
                name: body.name,
                isDeleted: false,
                _id: { $ne: new Types.ObjectId(id) }
            });
            if (existing) throw new BadRequestException('Issue category with this name already exists!');
        }

        const updated = await this.issueCateGoryRepo.updateById(body, new Types.ObjectId(id));
        if (!updated) throw new BadRequestException(updated instanceof Error ? updated : Messages.SOMETHING_WENT_WRONG);

        return { message: 'Issue category updated successfully.', data: updated };
    }

    async statusUpdate(id: string, body: StatusIssueCategoryDto): Promise<ApiResponse> {
        const updated = await this.issueCateGoryRepo.updateById(body, new Types.ObjectId(id));
        if (!updated) throw new BadRequestException(updated instanceof Error ? updated : Messages.SOMETHING_WENT_WRONG);
        return { message: 'Issue category status updated successfully.', data: updated };
    }

    async delete(id: string): Promise<ApiResponse> {
        const deleted = await this.issueCateGoryRepo.updateById({ isDeleted: true }, id);
        if (!deleted) throw new BadRequestException(deleted instanceof Error ? deleted : Messages.SOMETHING_WENT_WRONG);
        return { message: 'Issue category deleted successfully.' };
    }
}