import { Module } from "@nestjs/common";
import { WarrentyController } from "./warrenty.controller";
import { WarrentyService } from "./warrenty.service";
import { WarrentyApiController } from "./warrenty.api.controller";

@Module({
    controllers:[WarrentyController,WarrentyApiController],
    providers:[WarrentyService],
    exports:[WarrentyService]
})
export class WarrentyModule {
    
}