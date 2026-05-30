import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
    IsArray,
    IsEnum,
    IsMongoId,
    IsNotEmpty,
    IsNumber,
    IsOptional,
    IsString,
    ValidateIf,
    ValidateNested,
} from 'class-validator';
import { InvoiceStatus } from '@common/enum/invoice.status.enum';

class InvoiceItemDto {
    @ApiProperty({ description: 'Part name' })
    @IsString()
    @IsNotEmpty()
    part_name: string;

    @ApiProperty({ description: 'Part average price', default: 0 })
    @IsNumber()
    @IsOptional()
    @Type(() => Number)
    part_avg_price: number;

    @ApiProperty({ description: 'Part description', default: '' })
    @IsString()
    @IsOptional()
    part_description: string;

    @ApiProperty({ description: 'Part ID (ObjectId)', required: false, nullable: true })
    @ValidateIf((o) => o.part_id !== undefined && o.part_id !== null && o.part_id !== '' && o.part_id !== 'null')
    @IsMongoId({ message: 'part_id must be a valid MongoDB ObjectId' })
    part_id?: string | null;
}

export class CreateInvoiceDto {
    @ApiProperty({ description: 'Issue ID (ObjectId)', required: true })
    @IsMongoId({ message: 'issue_id must be a valid MongoDB ObjectId' })
    @IsNotEmpty({ message: 'issue_id is required' })
    issue_id: string;

    @ApiProperty({ type: [InvoiceItemDto], description: 'Invoice items' })
    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => InvoiceItemDto)
    items: InvoiceItemDto[];

    @ApiProperty({ description: 'Sub Total', default: 0 })
    @IsNumber()
    @IsOptional()
    @Type(() => Number)
    sub_total?: number;

    @ApiProperty({ description: 'Discount Amount', default: 0 })
    @IsNumber()
    @IsOptional()
    @Type(() => Number)
    discount_amount?: number;

    @ApiProperty({ description: 'Service Charges', default: 0 })
    @IsNumber()
    @IsOptional()
    @Type(() => Number)
    service_charges?: number;

    @ApiProperty({ description: 'Created By (User ID)', required: false })
    @IsMongoId({ message: 'createdBy must be a valid MongoDB ObjectId' })
    @IsOptional()
    createdBy?: string;

    @ApiProperty({ description: 'Tax', default: 0 })
    @IsNumber()
    @IsOptional()
    @Type(() => Number)
    tax?: number;


    @ApiProperty({ description: 'Visiting Charge', default: 0 })
    @IsNumber()
    @IsOptional()
    @Type(() => Number)
    visiting_charge?: number;

    @ApiProperty({ description: 'Warranty in months (0 for no warranty)', default: 0 })
    @IsNumber()
    @IsOptional()
    @Type(() => Number)
    warranty?: number;

    @ApiProperty({ description: 'Warranty Start Date', required: false })
    @IsOptional()
    warranty_start_date?: Date;

    @ApiProperty({ description: 'Warranty End Date', required: false })
    @IsOptional()
    warranty_end_date?: Date;

    @ApiProperty({ description: 'Total Amount', default: 0 })
    @IsNumber()
    @IsNotEmpty()
    @Type(() => Number)
    total_amount: number;

    @ApiProperty({ description: 'Invoice Status', enum: InvoiceStatus, default: InvoiceStatus.PENDING })
    @IsEnum(InvoiceStatus)
    @IsOptional()
    status?: InvoiceStatus;

    @ApiProperty({ description: 'Previous Invoice ID (ObjectId)', required: false })
    @IsMongoId({ message: 'prev_invoice_id must be a valid MongoDB ObjectId' })
    @IsOptional()
    prev_invoice_id?: string;
}

export class UpdateInvoiceDto {
    @ApiProperty({ type: [InvoiceItemDto], description: 'Invoice items', required: false })
    @IsArray()
    @IsOptional()
    @ValidateNested({ each: true })
    @Type(() => InvoiceItemDto)
    items?: InvoiceItemDto[];

    @ApiProperty({ description: 'Sub Total', required: false })
    @IsNumber()
    @IsOptional()
    @Type(() => Number)
    sub_total?: number;

    @ApiProperty({ description: 'Discount Amount', required: false })
    @IsNumber()
    @IsOptional()
    @Type(() => Number)
    discount_amount?: number;

    @ApiProperty({ description: 'Service Charges', required: false })
    @IsNumber()
    @IsOptional()
    @Type(() => Number)
    service_charges?: number;

    @ApiProperty({ description: 'Created By (User ID)', required: false })
    @IsMongoId({ message: 'createdBy must be a valid MongoDB ObjectId' })
    @IsOptional()
    createdBy?: string;

    @ApiProperty({ description: 'Tax', required: false })
    @IsNumber()
    @IsOptional()
    @Type(() => Number)
    tax?: number;

    @ApiProperty({ description: 'Visiting Charge', required: false })
    @IsNumber()
    @IsOptional()
    @Type(() => Number)
    visiting_charge?: number;

    @ApiProperty({ description: 'Warranty in months (0 for no warranty)', required: false })
    @IsNumber()
    @IsOptional()
    @Type(() => Number)
    warranty?: number;

    @ApiProperty({ description: 'Warranty Start Date', required: false })
    @IsOptional()
    warranty_start_date?: Date;

    @ApiProperty({ description: 'Warranty End Date', required: false })
    @IsOptional()
    warranty_end_date?: Date;

    @ApiProperty({ description: 'Total Amount', required: false })
    @IsNumber()
    @IsOptional()
    @Type(() => Number)
    total_amount?: number;

    @ApiProperty({ description: 'Invoice Status', enum: InvoiceStatus, required: false })
    @IsEnum(InvoiceStatus)
    @IsOptional()
    status?: InvoiceStatus;

    @ApiProperty({ description: 'Previous Invoice ID (ObjectId)', required: false })
    @IsMongoId({ message: 'prev_invoice_id must be a valid MongoDB ObjectId' })
    @IsOptional()
    prev_invoice_id?: string;
}

export class InvoiceListingDto {
    @ApiProperty({ default: 1, required: false })
    @IsNumber()
    @IsOptional()
    @Type(() => Number)
    page?: number;

    @ApiProperty({ default: 10, required: false })
    @IsNumber()
    @IsOptional()
    @Type(() => Number)
    limit?: number;

    @ApiProperty({ description: 'Search by invoice number', required: false })
    @IsString()
    @IsOptional()
    search?: string;

    @ApiProperty({ description: 'Filter by issue ID', required: false })
    @IsMongoId()
    @IsOptional()
    issue_id?: string;

    @ApiProperty({ description: 'Filter by status', enum: InvoiceStatus, required: false })
    @IsEnum(InvoiceStatus)
    @IsOptional()
    status?: InvoiceStatus;

    @ApiProperty({ description: 'Sort Field', required: false })
    @IsString()
    @IsOptional()
    sortField?: string;

    @ApiProperty({ description: 'Sort Order', required: false, enum: ['asc', 'desc'] })
    @IsString()
    @IsOptional()
    sortOrder?: string;
}
