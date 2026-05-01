import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { Types } from 'mongoose';
import { ApiResponse } from '@common/types/api-response.type';
import { Messages } from '@common/constants/messages';
import { PartsRepository } from './repositories/parts.repository';
import { PartsListingDto, SavePartDto, UpdatePartDto } from './dto/parts.category';

@Injectable()
export class PartsService {
    constructor(private readonly partsRepository: PartsRepository) { }

    async getAll(body: PartsListingDto): Promise<ApiResponse> {
        const data = await this.partsRepository.getAllPaginate(body);
        return { message: 'Parts fetched successfully.', data };
    }

    async save(body: SavePartDto): Promise<ApiResponse> {
        const existing = await this.partsRepository.getByField({ part_name: body.part_name, isDeleted: false });
        if (existing) throw new BadRequestException('Part with this name already exists!');

        const saved = await this.partsRepository.save(body);
        if (!saved) throw new BadRequestException(saved instanceof Error ? saved.message : Messages.SOMETHING_WENT_WRONG);

        return { message: 'Part saved successfully.', data: saved };
    }

    async get(id: string): Promise<ApiResponse> {
        const part = await this.partsRepository.getByField({ _id: new Types.ObjectId(id), isDeleted: false });
        if (!part) throw new NotFoundException('Part not found!');
        return { message: 'Part retrieved successfully.', data: part };
    }

    async update(id: string, body: UpdatePartDto): Promise<ApiResponse> {
        if (body.part_name) {
            const existing = await this.partsRepository.getByField({
                part_name: body.part_name,
                isDeleted: false,
                _id: { $ne: new Types.ObjectId(id) }
            });
            if (existing) throw new BadRequestException('Part with this name already exists!');
        }

        const updated = await this.partsRepository.updateById(body, new Types.ObjectId(id));
        if (!updated) throw new BadRequestException(updated instanceof Error ? updated : Messages.SOMETHING_WENT_WRONG);

        return { message: 'Part updated successfully.', data: updated };
    }

    async delete(id: string): Promise<ApiResponse> {
        const deleted = await this.partsRepository.updateById({ isDeleted: true }, id);
        if (!deleted) throw new BadRequestException(deleted instanceof Error ? deleted : Messages.SOMETHING_WENT_WRONG);
        return { message: 'Part deleted successfully.' };
    }
}