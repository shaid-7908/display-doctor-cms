import { IsNotEmpty, IsString, IsNumber, IsOptional, Matches, ValidateNested, IsArray } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Transform, TransformFnParams, Type } from 'class-transformer';


export class ProblemDto {
    @ApiProperty({ description: 'Problem Name', required: true })
    @IsString()
    @IsNotEmpty({ message: 'Problem name is required' })
    @Transform(({ value }: TransformFnParams) => value?.trim())
    name: string;

    @ApiProperty({ description: 'Problem Description', required: false })
    @IsString()
    @IsOptional()
    @Transform(({ value }: TransformFnParams) => value?.trim())
    description?: string;
}


export class SaveIssueCategoryDto {
    @ApiProperty({ description: 'Category Name', required: true })
    @IsString()
    @IsNotEmpty({ message: 'Category name is required' })
    @Transform(({ value }: TransformFnParams) => value?.trim())
    name: string;

    @ApiProperty({ description: 'Category Description', required: false })
    @IsString()
    @IsOptional()
    @Transform(({ value }: TransformFnParams) => value?.trim())
    description?: string;

    @ApiProperty({ description: 'Problems list', required: false, type: [ProblemDto] })
    @IsArray()
    @IsOptional()
    @ValidateNested({ each: true })
    @Type(() => ProblemDto)
    problem?: ProblemDto[];
}


export class UpdateIssueCategoryDto {
    @ApiProperty({ description: 'Category Name', required: false })
    @IsString()
    @IsOptional()
    @Transform(({ value }: TransformFnParams) => value?.trim())
    name?: string;

    @ApiProperty({ description: 'Category Description', required: false })
    @IsString()
    @IsOptional()
    @Transform(({ value }: TransformFnParams) => value?.trim())
    description?: string;

    @ApiProperty({ description: 'Problems list', required: false, type: [ProblemDto] })
    @IsArray()
    @IsOptional()
    @ValidateNested({ each: true })
    @Type(() => ProblemDto)
    problem?: ProblemDto[];
}


export class IssueCategoryListingDto {
    @ApiProperty({ default: 1 })
    @IsNumber()
    @IsOptional()
    page?: number;

    @ApiProperty({ default: 10 })
    @IsNumber()
    @IsOptional()
    limit?: number;

    @ApiProperty({ description: 'Search by name or description', required: false })
    @IsString()
    @IsOptional()
    search?: string;

    @ApiProperty({ description: 'Status Filter', required: false, enum: ['Active', 'Inactive'] })
    @IsString()
    @IsOptional()
    status?: string;

    @ApiProperty({ description: 'Sort Field', required: false })
    @IsString()
    @IsOptional()
    sortField?: string;

    @ApiProperty({ description: 'Sort Order', required: false, enum: ['asc', 'desc'] })
    @IsString()
    @IsOptional()
    sortOrder?: string;
}


export class StatusIssueCategoryDto {
    @ApiProperty({ description: 'Status', required: true, enum: ['Active', 'Inactive'] })
    @IsString()
    @IsNotEmpty({ message: 'Status is required' })
    @Matches(/^(Active|Inactive)$/, { message: 'Status must be either "Active" or "Inactive"' })
    @Transform(({ value }: TransformFnParams) => value?.trim())
    status: 'Active' | 'Inactive';
}
