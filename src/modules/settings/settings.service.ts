import { Injectable } from '@nestjs/common';
import { SettingsRepository } from './repository/settings.repository';
import { UpdateSettingsDto } from './dto/settings.dto';
import type { ApiResponse } from '@common/types/api-response.type';

@Injectable()
export class SettingsService {
    constructor(
        private readonly settingsRepository: SettingsRepository,
    ) {}

    async getSettings(): Promise<ApiResponse> {
        let settings = await this.settingsRepository.getByField({ isDeleted: false });
        if (!settings) {
            settings = await this.settingsRepository.save({ siteLogo: '', invoiceAddress: '' });
        }
        return { message: 'Settings retrieved successfully.', data: settings };
    }

    async updateSettings(body: UpdateSettingsDto, files: Express.Multer.File[]): Promise<ApiResponse> {
        let settings = await this.settingsRepository.getByField({ isDeleted: false });
        
        const updateData: Partial<UpdateSettingsDto> = {
            ...body
        };

        if (files && files.length > 0) {
            updateData.siteLogo = (files[0] as any).location || files[0].filename;
        }

        if (!settings) {
            settings = await this.settingsRepository.save(updateData);
        } else {
            settings = await this.settingsRepository.updateById(updateData, settings._id);
        }

        return { message: 'Settings updated successfully.', data: settings };
    }
}
