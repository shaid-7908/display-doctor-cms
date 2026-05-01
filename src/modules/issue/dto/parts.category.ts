import { IsNotEmpty, IsString, IsNumber, IsOptional, IsMongoId, Matches } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Transform, TransformFnParams } from 'class-transformer';


export class SavePartDto {
    @ApiProperty({ description: 'Part Name', required: true })
    @IsString()
    @IsNotEmpty({ message: 'Part name is required' })
    @Transform(({ value }: TransformFnParams) => value?.trim())
    part_name: string;

    @ApiProperty({ description: 'Average Price', required: false, default: 0 })
    @IsNumber()
    @IsOptional()
    part_avg_price?: number;

    @ApiProperty({ description: 'Part Description', required: false })
    @IsString()
    @IsOptional()
    @Transform(({ value }: TransformFnParams) => value?.trim())
    part_description?: string;

    @ApiProperty({ description: 'Category ID (ObjectId)', required: false })
    @IsMongoId({ message: 'category_id must be a valid MongoDB ObjectId' })
    @IsOptional()
    category_id?: string;
}


export class UpdatePartDto {
    @ApiProperty({ description: 'Part Name', required: false })
    @IsString()
    @IsOptional()
    @Transform(({ value }: TransformFnParams) => value?.trim())
    part_name?: string;

    @ApiProperty({ description: 'Average Price', required: false })
    @IsNumber()
    @IsOptional()
    part_avg_price?: number;

    @ApiProperty({ description: 'Part Description', required: false })
    @IsString()
    @IsOptional()
    @Transform(({ value }: TransformFnParams) => value?.trim())
    part_description?: string;

    @ApiProperty({ description: 'Category ID (ObjectId)', required: false })
    @IsMongoId({ message: 'category_id must be a valid MongoDB ObjectId' })
    @IsOptional()
    category_id?: string;
}


export class PartsListingDto {
    @ApiProperty({ default: 1 })
    @IsNumber()
    @IsOptional()
    page?: number;

    @ApiProperty({ default: 10 })
    @IsNumber()
    @IsOptional()
    limit?: number;

    @ApiProperty({ description: 'Search by part name or description', required: false })
    @IsString()
    @IsOptional()
    search?: string;

    @ApiProperty({ description: 'Filter by category ID', required: false })
    @IsMongoId()
    @IsOptional()
    category_id?: string;

    @ApiProperty({ description: 'Sort Field', required: false })
    @IsString()
    @IsOptional()
    sortField?: string;

    @ApiProperty({ description: 'Sort Order', required: false, enum: ['asc', 'desc'] })
    @IsString()
    @IsOptional()
    sortOrder?: string;
}


export class StatusPartDto {
    @ApiProperty({ description: 'Part ID', required: true })
    @IsMongoId()
    @IsNotEmpty()
    id: string;
}
