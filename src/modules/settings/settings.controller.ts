import { Body, Controller, Get, HttpCode, Post, UseGuards, Version, UseInterceptors, UploadedFiles } from '@nestjs/common';
import { ApiBearerAuth, ApiConsumes, ApiTags, ApiOperation } from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import { SettingsService } from './settings.service';
import { UpdateSettingsDto } from './dto/settings.dto';
import { S3SingleFileInterceptor } from '@common/interceptors/files.interceptor';

@ApiTags('Settings')
@Controller('admin/settings')
export class SettingsController {
    constructor(private readonly settingsService: SettingsService) {}

    @Version('1')
    @Get()
    @UseGuards(AuthGuard('jwt'))
    @ApiBearerAuth()
    @HttpCode(200)
    @ApiOperation({ summary: 'Get site settings' })
    async getSettings() {
        return this.settingsService.getSettings();
    }

    @Version('1')
    @Post()
    @UseGuards(AuthGuard('jwt'))
    @ApiBearerAuth()
    @ApiConsumes('multipart/form-data')
    @UseInterceptors(S3SingleFileInterceptor('logo', 'siteLogo'))
    @HttpCode(200)
    @ApiOperation({ summary: 'Update site settings' })
    async updateSettings(@Body() dto: UpdateSettingsDto, @UploadedFiles() files: Express.Multer.File[]) {
        return this.settingsService.updateSettings(dto, files);
    }
}
