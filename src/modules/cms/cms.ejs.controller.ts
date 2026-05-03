import { LoginUser } from "@common/decorator/login-user.decorator";
import { UserDocument } from "@modules/users/schemas/user.schema";
import { Controller, Get, Render, UseGuards } from "@nestjs/common";
import { AuthGuard } from "@nestjs/passport";

import { ConfigService } from "@nestjs/config";
import { IssueCategoryService } from "../issue/issue-category.service";

@Controller('')
export class CmsEjsController {
    constructor(
        private readonly configService: ConfigService,
        private readonly issueCategoryService: IssueCategoryService
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

    @Get('cms/issues')
    @UseGuards(AuthGuard('jwt'))
    @Render('cms/issue-admin')
    async renderIssueAdminPage(@LoginUser() user: Partial<UserDocument>) {
        const categories = await this.issueCategoryService.getAll({ limit: 1000, page: 1 });
        //console.log(categories.data)
        return {
            user,
            projectName: this.configService.get('PROJECT_NAME'),
            pageName: 'Issue',
            title: 'Issue',
            categories: categories.data
        };
    }

    @Get('login')
    @Render('cms/login')
    async renderLogin(){
        return {data:'dd'}
    }

}