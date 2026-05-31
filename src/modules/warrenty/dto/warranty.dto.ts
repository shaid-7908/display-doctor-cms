import { InvoiceStatus } from "@common/enum/invoice.status.enum";
import { ApiProperty } from "@nestjs/swagger";
import { Type } from "class-transformer";
import { IsEnum, IsMongoId, IsNumber, IsOptional, IsString } from "class-validator";

export class WarrantyListingDto {
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

    @ApiProperty({ description: 'Filter by technician (User ID)', required: false })
    @IsMongoId({ message: 'assigendTo must be a valid MongoDB ObjectId' })
    @IsOptional()
    assigendTo?: string;

    @ApiProperty({ description: 'Sort Field', required: false })
    @IsString()
    @IsOptional()
    sortField?: string;

    @ApiProperty({ description: 'Sort Order', required: false, enum: ['asc', 'desc'] })
    @IsString()
    @IsOptional()
    sortOrder?: string;
}