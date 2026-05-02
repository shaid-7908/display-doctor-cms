import { LoginUser } from "@common/decorator/login-user.decorator";
import { UserDocument } from "@modules/users/schemas/user.schema";
import { Controller, Get, Render, UseGuards } from "@nestjs/common";
import { AuthGuard } from "@nestjs/passport";

import { ConfigService } from "@nestjs/config";
import { AuthService } from "src/auth/auth.service";

@Controller('')
export class CmsEjsController {
    constructor(
        private readonly configService: ConfigService,
        //private readonly authService: AuthService
    ) { }

    @Get('')
    @UseGuards(AuthGuard('jwt'))
    @Render('cms/index')
    async renderDashboard(@LoginUser() user: Partial<UserDocument>) {
        return {
            user,
            projectName: this.configService.get('PROJECT_NAME'),
            data: 'dd'
        };
    }

    @Get('cms/technicians')
    @UseGuards(AuthGuard('jwt'))
    @Render('cms/technicians')
    async renderTechnicianPage(@LoginUser() user: Partial<UserDocument>) {
        return {
            user,
            projectName: this.configService.get('PROJECT_NAME'),
            data: 'dd'
        };
    }

    @Get('cms/roles')
    @UseGuards(AuthGuard('jwt'))
    @Render('cms/role')
    async renderRolePage(@LoginUser() user: Partial<UserDocument>) {
        return {
            user,
            projectName: this.configService.get('PROJECT_NAME'),
            pageName:'Roles',
            title:'Roles'
        };
    }

    @Get('cms/issue-category')
    @UseGuards(AuthGuard('jwt'))
    @Render('cms/issue-category')
    async renderIssueCategoryPage(@LoginUser() user: Partial<UserDocument>) {
        return {
            user,
            projectName: this.configService.get('PROJECT_NAME'),
            pageName:'Issue Category',
            title:'Issue Category'
        };
    }

    @Get('cms/parts')
    @UseGuards(AuthGuard('jwt'))
    @Render('cms/parts')
    async renderPartsPage(@LoginUser() user: Partial<UserDocument>) {
        return {
            user,
            projectName: this.configService.get('PROJECT_NAME'),
            pageName:'Parts',
            title:'Parts'
        };
    }

    @Get('login')
    @Render('cms/login')
    async renderLogin(){
        return {data:'dd'}
    }

}