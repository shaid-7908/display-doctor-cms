import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { BaseRepository } from '@common/bases/base.repository';
import { Settings, SettingsDocument } from '../schema/settings.schema';

@Injectable()
export class SettingsRepository extends BaseRepository<SettingsDocument> {
    constructor(
        @InjectModel(Settings.name) private readonly SettingsModel: Model<SettingsDocument>,
    ) {
        super(SettingsModel);
    }
}
