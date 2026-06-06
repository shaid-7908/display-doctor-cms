import { ApiProperty } from "@nestjs/swagger";
import { Transform, TransformFnParams } from "class-transformer";
import { IsOptional, IsString } from "class-validator";

export class UpdateSettingsDto {
    @ApiProperty({
        description: 'Site Logo file to upload',
        type: 'string',
        format: 'binary',
        required: false
    })
    @IsOptional()
    siteLogo?: string;

    @ApiProperty({ description: 'Invoice Address', required: false })
    @IsString()
    @IsOptional()
    @Transform(({ value }: TransformFnParams) => value?.trim())
    invoiceAddress?: string;
}
