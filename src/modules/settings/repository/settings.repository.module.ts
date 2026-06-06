import { Global, Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Settings, SettingsSchema } from '../schema/settings.schema';
import { SettingsRepository } from './settings.repository';

@Global()
@Module({
    imports: [
        MongooseModule.forFeatureAsync([
            {
                name: Settings.name,
                useFactory: () => {
                    const schema = SettingsSchema;
                    return schema;
                }
            }
        ])
    ],
    controllers: [],
    providers: [SettingsRepository],
    exports: [SettingsRepository]
})
export class SettingsRepositoryModule {}
