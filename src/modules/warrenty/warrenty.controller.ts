import { Body, Controller, HttpCode, Post, UseGuards, Version } from "@nestjs/common";
import { WarrentyService } from "./warrenty.service";
import { WarrantyListingDto } from "./dto/warranty.dto";
import { AuthGuard } from "@nestjs/passport";
import { ApiBearerAuth } from "@nestjs/swagger";

@Controller('admin/warranty')
export class WarrentyController {
    constructor(private readonly warrentyService:WarrentyService){}

    @Version('1')
    @Post('getall')
    @UseGuards(AuthGuard('jwt'))
    @ApiBearerAuth()
    @HttpCode(200)
    async getAllInWarrentyIssue(@Body()dto:WarrantyListingDto){
        return await this.warrentyService.getAllWarrenty(dto);
    }
}