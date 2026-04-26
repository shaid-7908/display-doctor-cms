import { ApiPropertyOptional } from "@nestjs/swagger";
import { IsOptional, IsString } from "class-validator";

export class RefreshJwtDto {
    @IsOptional()
    @IsString()
    @ApiPropertyOptional({ description: 'Refresh token to get new access token (cookie preferred)' })
    refreshToken?: string;
}

export class LogoutDto {
    @IsOptional()
    @IsString()
    @ApiPropertyOptional({ description: 'Refresh token to revoke (cookie preferred)' })
    refreshToken?: string;
}


