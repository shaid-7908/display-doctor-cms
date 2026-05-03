import { Body, Controller, Delete, Get, HttpCode, Param, Patch, Post, UseGuards, Version } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import { MongoIdPipe } from '@common/pipes/mongoid.pipe';
import { IssueService } from './issue.service';
import { CreateIssueDto, IssueListingDto, IssueStatusDto, UpdateIssueDto } from './dto/issue.dto';

@ApiTags('Issue')
@Controller('admin/issue')
export class IssueController {
    constructor(private readonly issueService: IssueService) { }

    @Version('1')
    @Post('getall')
    @UseGuards(AuthGuard('jwt'))
    @ApiBearerAuth()
    @HttpCode(200)
    async getAll(@Body() dto: IssueListingDto) {
        return this.issueService.getAll(dto);
    }

    @Version('1')
    @Post()
    @UseGuards(AuthGuard('jwt'))
    @ApiBearerAuth()
    async create(@Body() dto: CreateIssueDto) {
        return this.issueService.create(dto);
    }

    @Version('1')
    @Get(':id')
    @UseGuards(AuthGuard('jwt'))
    @ApiBearerAuth()
    @HttpCode(200)
    async get(@Param('id', new MongoIdPipe()) id: string) {
        return this.issueService.get(id);
    }

    @Version('1')
    @Patch(':id')
    @UseGuards(AuthGuard('jwt'))
    @ApiBearerAuth()
    async update(@Param('id', new MongoIdPipe()) id: string, @Body() dto: UpdateIssueDto) {
        return this.issueService.update(id, dto);
    }

    @Version('1')
    @Patch('status-change/:id')
    @UseGuards(AuthGuard('jwt'))
    @ApiBearerAuth()
    @HttpCode(200)
    async statusChange(@Param('id', new MongoIdPipe()) id: string, @Body() dto: IssueStatusDto) {
        return this.issueService.statusChange(id, dto);
    }

    @Version('1')
    @Delete(':id')
    @UseGuards(AuthGuard('jwt'))
    @ApiBearerAuth()
    @HttpCode(200)
    async delete(@Param('id', new MongoIdPipe()) id: string) {
        return this.issueService.delete(id);
    }
}