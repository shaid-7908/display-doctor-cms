import { BadRequestException, Controller, Get, NotFoundException, Query } from "@nestjs/common";
import { WarrentyService } from "./warrenty.service";

@Controller('api/warrenty')
export class WarrentyApiController {
    constructor(private readonly warrentyService:WarrentyService){}

    @Get()
    async getWarrentyInfo(@Query('inv_number') inv_number:string){
        if(!inv_number){
            throw new BadRequestException("Invoice number is required");
        }
        const invoice = await this.warrentyService.getWarrentyDetailsPublic(inv_number);
        
        if(!invoice){
            throw new NotFoundException("Invoice not found");
        }
        return invoice
        
    }
}