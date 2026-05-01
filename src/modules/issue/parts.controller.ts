import { Body, Controller, Delete, Get, HttpCode, Param, Patch, Post, UseGuards, Version } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import { MongoIdPipe } from '@common/pipes/mongoid.pipe';
import { PartsService } from './parts.service';
import { PartsListingDto, SavePartDto, UpdatePartDto } from './dto/parts.category';

@ApiTags('Parts')
@Controller('admin/parts')
export class PartsController {
    constructor(private readonly partsService: PartsService) { }

    @Version('1')
    @Post('getall')
    @UseGuards(AuthGuard('jwt'))
    @ApiBearerAuth()
    @HttpCode(200)
    async getAll(@Body() dto: PartsListingDto) {
        return this.partsService.getAll(dto);
    }

    @Version('1')
    @Post()
    @UseGuards(AuthGuard('jwt'))
    @ApiBearerAuth()
    async save(@Body() dto: SavePartDto) {
        return this.partsService.save(dto);
    }

    @Version('1')
    @Get(':id')
    @UseGuards(AuthGuard('jwt'))
    @ApiBearerAuth()
    @HttpCode(200)
    async get(@Param('id', new MongoIdPipe()) id: string) {
        return this.partsService.get(id);
    }

    @Version('1')
    @Patch(':id')
    @UseGuards(AuthGuard('jwt'))
    @ApiBearerAuth()
    async update(@Param('id', new MongoIdPipe()) id: string, @Body() dto: UpdatePartDto) {
        return this.partsService.update(id, dto);
    }

    @Version('1')
    @Delete(':id')
    @UseGuards(AuthGuard('jwt'))
    @ApiBearerAuth()
    @HttpCode(200)
    async delete(@Param('id', new MongoIdPipe()) id: string) {
        return this.partsService.delete(id);
    }
}