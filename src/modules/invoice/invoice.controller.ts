import { Body, Controller, Delete, Get, HttpCode, Param, Patch, Post, Res, UseGuards, Version } from '@nestjs/common';
import { ApiBearerAuth, ApiTags, ApiOperation } from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import { MongoIdPipe } from '@common/pipes/mongoid.pipe';
import { InvoiceService } from './invoice.service';
import { CreateInvoiceDto, InvoiceListingDto, UpdateInvoiceDto } from './dto/invoice.dto';
import { LoginUser } from '@common/decorator/login-user.decorator';
import { UserDocument } from '@modules/users/schemas/user.schema';
import { Response } from 'express';

@ApiTags('Invoice')
@Controller('admin/invoice')
export class InvoiceController {
    constructor(private readonly invoiceService: InvoiceService) { }

    @Version('1')
    @Post('getall')
    @UseGuards(AuthGuard('jwt'))
    @ApiBearerAuth()
    @HttpCode(200)
    @ApiOperation({ summary: 'Get all invoices (paginated)' })
    async getAll(@Body() dto: InvoiceListingDto) {
        return this.invoiceService.findAll(dto);
    }

    @Version('1')
    @Post()
    @UseGuards(AuthGuard('jwt'))
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Create a new invoice' })
    async create(@Body() dto: CreateInvoiceDto, @LoginUser() user:Partial<UserDocument>) {
        return this.invoiceService.create(dto,user);
    }

    @Version('1')
    @Get('download/:id')
    @UseGuards(AuthGuard('jwt'))
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Download invoice PDF' })
    async downloadPdf(@Param('id', new MongoIdPipe()) id: string, @Res() res: Response) {
        try {
            const pdfBuffer = await this.invoiceService.generatePdf(id);
            res.set({
                'Content-Type': 'application/pdf',
                'Content-Disposition': `attachment; filename=invoice-${id}.pdf`,
                'Content-Length': pdfBuffer.length
            });
            res.end(pdfBuffer);
        } catch (error) {
            res.status(500).json({ message: error.message || 'Failed to generate PDF' });
        }
    }

    @Version('1')
    @Get(':id')
    @UseGuards(AuthGuard('jwt'))
    @ApiBearerAuth()
    @HttpCode(200)
    @ApiOperation({ summary: 'Get invoice details' })
    async get(@Param('id', new MongoIdPipe()) id: string) {
        return this.invoiceService.findOne(id);
    }

    @Version('1')
    @Patch(':id')
    @UseGuards(AuthGuard('jwt'))
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Update invoice' })
    async update(@Param('id', new MongoIdPipe()) id: string, @Body() dto: UpdateInvoiceDto) {
        return this.invoiceService.update(id, dto);
    }

    @Version('1')
    @Delete(':id')
    @UseGuards(AuthGuard('jwt'))
    @ApiBearerAuth()
    @HttpCode(200)
    @ApiOperation({ summary: 'Delete invoice (soft delete)' })
    async delete(@Param('id', new MongoIdPipe()) id: string) {
        return this.invoiceService.remove(id);
    }
}
