import { Body, Controller, Delete, Get, HttpCode, Param, Patch, Post, UseGuards, Version } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import { MongoIdPipe } from '@common/pipes/mongoid.pipe';
import { IssueCategoryService } from './issue-category.service';
import {
    IssueCategoryListingDto,
    SaveIssueCategoryDto,
    StatusIssueCategoryDto,
    UpdateIssueCategoryDto
} from './dto/issue-category.dto';

@ApiTags('Issue Category')
@Controller('admin/issue-category')
export class IssueCategoryController {
    constructor(private readonly issueCateGoryService: IssueCategoryService) { }

    @Version('1')
    @Post('getall')
    @UseGuards(AuthGuard('jwt'))
    @ApiBearerAuth()
    @HttpCode(200)
    async getAll(@Body() dto: IssueCategoryListingDto) {
        return this.issueCateGoryService.getAll(dto);
    }

    @Version('1')
    @Post()
    @UseGuards(AuthGuard('jwt'))
    @ApiBearerAuth()
    async save(@Body() dto: SaveIssueCategoryDto) {
        return this.issueCateGoryService.save(dto);
    }

    @Version('1')
    @Get(':id')
    @UseGuards(AuthGuard('jwt'))
    @ApiBearerAuth()
    @HttpCode(200)
    async get(@Param('id', new MongoIdPipe()) id: string) {
        return this.issueCateGoryService.get(id);
    }

    @Version('1')
    @Patch(':id')
    @UseGuards(AuthGuard('jwt'))
    @ApiBearerAuth()
    async update(@Param('id', new MongoIdPipe()) id: string, @Body() dto: UpdateIssueCategoryDto) {
        return this.issueCateGoryService.update(id, dto);
    }

    @Version('1')
    @Patch('status-change/:id')
    @UseGuards(AuthGuard('jwt'))
    @ApiBearerAuth()
    @HttpCode(200)
    async statusChange(@Param('id', new MongoIdPipe()) id: string, @Body() dto: StatusIssueCategoryDto) {
        return this.issueCateGoryService.statusUpdate(id, dto);
    }

    @Version('1')
    @Delete(':id')
    @UseGuards(AuthGuard('jwt'))
    @ApiBearerAuth()
    @HttpCode(200)
    async delete(@Param('id', new MongoIdPipe()) id: string) {
        return this.issueCateGoryService.delete(id);
    }
}