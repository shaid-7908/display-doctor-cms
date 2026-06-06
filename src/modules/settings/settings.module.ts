import { Module } from '@nestjs/common';
import { SettingsController } from './settings.controller';
import { SettingsService } from './settings.service';
import { SettingsRepositoryModule } from './repository/settings.repository.module';

@Module({
    imports: [
        SettingsRepositoryModule
    ],
    controllers: [SettingsController],
    providers: [SettingsService],
    exports: [SettingsService]
})
export class SettingsModule {}
