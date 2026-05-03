import { IssueStatus } from '@common/enum/issue.status.enum';
import { ApiProperty } from '@nestjs/swagger';
import { Transform, TransformFnParams } from 'class-transformer';
import {
    IsEmail,
    IsEnum,
    IsMongoId,
    IsNotEmpty,
    IsOptional,
    IsString,
    IsDateString,
    IsNumber,
    IsMobilePhone,
} from 'class-validator';

export class CreateIssueDto {
    @ApiProperty({ description: 'Category ID (ObjectId)', required: true })
    @IsMongoId({ message: 'category_id must be a valid MongoDB ObjectId' })
    @IsNotEmpty({ message: 'category_id is required' })
    category_id: string;

    @ApiProperty({ description: 'Customer Name', required: true })
    @IsString()
    @IsNotEmpty({ message: 'customer_name is required' })
    @Transform(({ value }: TransformFnParams) => value?.trim())
    customer_name: string;

    @ApiProperty({ description: 'Customer Phone', required: true })
    @IsMobilePhone()
    @IsNotEmpty({ message: 'customer_phone is required' })
    @Transform(({ value }: TransformFnParams) => value?.trim())
    customer_phone: string;

    @ApiProperty({ description: 'Customer Email', required: false })
    @IsEmail({}, { message: 'customer_email must be a valid email' })
    @IsOptional()
    @Transform(({ value }: TransformFnParams) => value?.trim())
    customer_email?: string;

    @ApiProperty({ description: 'Issue Description', required: true })
    @IsString()
    @IsNotEmpty({ message: 'issue_description is required' })
    @Transform(({ value }: TransformFnParams) => value?.trim())
    issue_description: string;

    @ApiProperty({ description: 'Technician ID (ObjectId)', required: false })
    @IsMongoId({ message: 'technician_id must be a valid MongoDB ObjectId' })
    @IsOptional()
    technician_id?: string;

    @ApiProperty({ description: 'Scheduled Date', required: false })
    @IsDateString()
    @IsOptional()
    scheduled_date?: string;
}

export class UpdateIssueDto {
    @ApiProperty({ description: 'Category ID (ObjectId)', required: false })
    @IsMongoId({ message: 'category_id must be a valid MongoDB ObjectId' })
    @IsOptional()
    category_id?: string;

    @ApiProperty({ description: 'Customer Name', required: false })
    @IsString()
    @IsOptional()
    @Transform(({ value }: TransformFnParams) => value?.trim())
    customer_name?: string;

    @ApiProperty({ description: 'Customer Phone', required: false })
    @IsMobilePhone()
    @IsOptional()
    @Transform(({ value }: TransformFnParams) => value?.trim())
    customer_phone?: string;

    @ApiProperty({ description: 'Customer Email', required: false })
    @IsEmail({}, { message: 'customer_email must be a valid email' })
    @IsOptional()
    @Transform(({ value }: TransformFnParams) => value?.trim())
    customer_email?: string;

    @ApiProperty({ description: 'Issue Description', required: false })
    @IsString()
    @IsOptional()
    @Transform(({ value }: TransformFnParams) => value?.trim())
    issue_description?: string;

    @ApiProperty({ description: 'Technician ID (ObjectId)', required: false })
    @IsMongoId({ message: 'technician_id must be a valid MongoDB ObjectId' })
    @IsOptional()
    technician_id?: string;

    @ApiProperty({ description: 'Scheduled Date', required: false })
    @IsDateString()
    @IsOptional()
    scheduled_date?: string;

    @ApiProperty({ description: 'Resolution Notes', required: false })
    @IsString()
    @IsOptional()
    @Transform(({ value }: TransformFnParams) => value?.trim())
    resolution_notes?: string;
}

export class IssueStatusDto {
    @ApiProperty({ description: 'Issue Status', enum: IssueStatus, required: true })
    @IsEnum(IssueStatus, { message: `status must be one of: ${Object.values(IssueStatus).join(', ')}` })
    @IsNotEmpty()
    status: IssueStatus;
}

export class IssueListingDto {
    @ApiProperty({ default: 1, required: false })
    @IsNumber()
    @IsOptional()
    page?: number;

    @ApiProperty({ default: 10, required: false })
    @IsNumber()
    @IsOptional()
    limit?: number;

    @ApiProperty({ description: 'Search by customer name, phone, or ticket number', required: false })
    @IsString()
    @IsOptional()
    search?: string;

    @ApiProperty({ description: 'Filter by category ID', required: false })
    @IsMongoId()
    @IsOptional()
    category_id?: string;

    @ApiProperty({ description: 'Filter by technician ID', required: false })
    @IsMongoId()
    @IsOptional()
    technician_id?: string;

    @ApiProperty({ description: 'Filter by status', enum: IssueStatus, required: false })
    @IsEnum(IssueStatus)
    @IsOptional()
    status?: IssueStatus;

    @ApiProperty({ description: 'Sort Field', required: false })
    @IsString()
    @IsOptional()
    sortField?: string;

    @ApiProperty({ description: 'Sort Order', required: false, enum: ['asc', 'desc'] })
    @IsString()
    @IsOptional()
    sortOrder?: string;
}
