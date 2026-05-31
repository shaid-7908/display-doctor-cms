import { InvoiceRepository } from "@modules/invoice/repositories/invoice.repository";
import { Injectable, NotFoundException } from "@nestjs/common";
import { WarrantyListingDto } from "./dto/warranty.dto";

@Injectable()
export class WarrentyService {
    constructor(private readonly invoiceRepo:InvoiceRepository){}


    async getAllWarrenty(paginatedDto: WarrantyListingDto){
        return this.invoiceRepo.getAllInWarrentyIssue(paginatedDto);
    }

    async getWarrentyDetailsPublic(invoice_number:string){

        const invoice = await this.invoiceRepo.getByInvoiceNumber(invoice_number);
        if(!invoice){
            throw new NotFoundException("Invoice not found");
        }
        return invoice;
    }
}