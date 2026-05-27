import { Injectable, NotFoundException } from '@nestjs/common';
import { InvoiceRepository } from './repositories/invoice.repository';
import { CreateInvoiceDto, InvoiceListingDto, UpdateInvoiceDto } from './dto/invoice.dto';

@Injectable()
export class InvoiceService {
    constructor(private readonly invoiceRepository: InvoiceRepository) {}

    async create(createInvoiceDto: CreateInvoiceDto) {
        return await this.invoiceRepository.save(createInvoiceDto);
    }

    async findAll(query: InvoiceListingDto) {
        return await this.invoiceRepository.getAllPaginate(query);
    }

    async findOne(id: string) {
        const invoice = await this.invoiceRepository.getById(id);
        if (!invoice || invoice.isDeleted) {
            throw new NotFoundException('Invoice not found');
        }
        return invoice;
    }

    async update(id: string, updateInvoiceDto: UpdateInvoiceDto) {
        await this.findOne(id);
        return await this.invoiceRepository.updateById(updateInvoiceDto,id);
    }

    async remove(id: string) {
        await this.findOne(id);
        return await this.invoiceRepository.updateById({ isDeleted: true },id);
    }
}
