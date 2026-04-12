import { Controller, Get, Render } from "@nestjs/common";

@Controller('')
export class CmsEjsController{

    @Get('')
    @Render('cms/index')
    async renderDashboard(){
        return {data:'dd'}
    }

}