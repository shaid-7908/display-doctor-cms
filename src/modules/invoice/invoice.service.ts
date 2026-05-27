import { Injectable, NotFoundException } from '@nestjs/common';
import { InvoiceRepository } from './repositories/invoice.repository';
import { CreateInvoiceDto, InvoiceListingDto, UpdateInvoiceDto } from './dto/invoice.dto';
import { UserDocument } from '@modules/users/schemas/user.schema';

@Injectable()
export class InvoiceService {
    constructor(private readonly invoiceRepository: InvoiceRepository) {}

    async create(createInvoiceDto: CreateInvoiceDto , user:Partial<UserDocument>) {
        if (createInvoiceDto.warranty && createInvoiceDto.warranty > 0) {
            const start = new Date();
            const end = new Date();
            end.setMonth(end.getMonth() + createInvoiceDto.warranty);
            createInvoiceDto.warranty_start_date = start;
            createInvoiceDto.warranty_end_date = end;
        } else {
            createInvoiceDto.warranty_start_date = null;
            createInvoiceDto.warranty_end_date = null;
        }
        createInvoiceDto.createdBy = user?._id.toString();
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
        if (updateInvoiceDto.warranty !== undefined) {
            if (updateInvoiceDto.warranty > 0) {
                const start = new Date();
                const end = new Date();
                end.setMonth(end.getMonth() + updateInvoiceDto.warranty);
                updateInvoiceDto.warranty_start_date = start;
                updateInvoiceDto.warranty_end_date = end;
            } else {
                updateInvoiceDto.warranty_start_date = null;
                updateInvoiceDto.warranty_end_date = null;
            }
        }
        return await this.invoiceRepository.updateById(updateInvoiceDto,id);
    }

    async remove(id: string) {
        await this.findOne(id);
        return await this.invoiceRepository.updateById({ isDeleted: true },id);
    }
}
