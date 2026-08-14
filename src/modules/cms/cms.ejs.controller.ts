import { LoginUser } from "@common/decorator/login-user.decorator";
import { UserDocument } from "@modules/users/schemas/user.schema";
import { Controller, Get, Param, Render, UseGuards } from "@nestjs/common";
import { AuthGuard } from "@nestjs/passport";

import { ConfigService } from "@nestjs/config";
import { IssueCategoryService } from "../issue/issue-category.service";
import { MongoIdPipe } from "@common/pipes/mongoid.pipe";
import { IssueService } from "@modules/issue/issue.service";
import { InvoiceService } from "../invoice/invoice.service";

@Controller('')
export class CmsEjsController {
    constructor(
        private readonly configService: ConfigService,
        private readonly issueCategoryService: IssueCategoryService,
        private readonly issueService: IssueService,
        private readonly invoiceService: InvoiceService
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
        return {
            user,
            projectName: this.configService.get('PROJECT_NAME'),
            pageName: 'Issue',
            title: 'Issue',
            categories: categories.data
        };
    }

    @Get('cms/issue-details/:id')
    @UseGuards(AuthGuard('jwt'))
    @Render('cms/issue-details')
    async renderIssueDetailsPage(@Param('id', new MongoIdPipe()) id: string, @LoginUser() user: Partial<UserDocument>) {
        const issue = await this.issueService.getIssueDetailsForEjs(id);
        console.log('issue',issue)
        if (!issue) {
            // You might want to redirect to a 404 page or back to the list
            // For now, let's just pass null and handle it in the template
        }
        return {
            user,
            projectName: this.configService.get('PROJECT_NAME'),
            pageName: 'Issue Details',
            title: 'Issue Details',
            issue: issue || null
        };
    }


    @Get('cms/invoices')
    @UseGuards(AuthGuard('jwt'))
    @Render('cms/invoices-admin')
    async renderInvoicesPage(@LoginUser() user: Partial<UserDocument>) {
        return {
            user,
            projectName: this.configService.get('PROJECT_NAME'),
            pageName:'Invoices',
            title:'Invoices'
        };
    }

    @Get('cms/warranties')
    @UseGuards(AuthGuard('jwt'))
    @Render('cms/warranties')
    async renderWarrantiesPage(@LoginUser() user: Partial<UserDocument>) {
        return {
            user,
            projectName: this.configService.get('PROJECT_NAME'),
            pageName:'Warranties',
            title:'Warranties'
        };
    }

    @Get('cms/create-invoice')
    @UseGuards(AuthGuard('jwt'))
    @Render('cms/create-invoice')
    async renderCreateInvoicePage(@LoginUser() user: Partial<UserDocument>) {
        return {
            user,
            projectName: this.configService.get('PROJECT_NAME'),
            pageName:'Create Invoice',
            title:'Create Invoice',
            invoiceId: undefined
        };
    }

    @Get('cms/invoice/edit/:id')
    @UseGuards(AuthGuard('jwt'))
    @Render('cms/edit-invoice')
    async renderEditInvoicePage(@Param('id', new MongoIdPipe()) id: string, @LoginUser() user: Partial<UserDocument>) {
        return {
            user,
            projectName: this.configService.get('PROJECT_NAME'),
            pageName: 'Edit Invoice',
            title: 'Edit Invoice',
            invoiceId: id
        };
    }

    @Get('cms/invoice/view/:id')
    @UseGuards(AuthGuard('jwt'))
    @Render('cms/invoice-format')
    async renderInvoiceFormatPage(@Param('id', new MongoIdPipe()) id: string, @LoginUser() user: Partial<UserDocument>) {
        const invoice = await this.invoiceService.findOne(id);
        const populatedInvoice = await invoice.populate(['issue_id', 'assigendTo']);
        
        return {
            user,
            projectName: this.configService.get('PROJECT_NAME'),
            invoice: {
                ...populatedInvoice.toObject(),
                issue: populatedInvoice.issue_id
            },
            isPdf: false,
            publicPath: ''
        };
    }

    @Get('cms/settings')
    @UseGuards(AuthGuard('jwt'))
    @Render('cms/settings')
    async renderSettingsPage(@LoginUser() user: Partial<UserDocument>) {
        return {
            user,
            projectName: this.configService.get('PROJECT_NAME'),
            pageName:'Settings',
            title:'Settings'
        };
    }

    @Get('login')
    @Render('cms/login')
    async renderLogin(){
        return {data:'dd'}
    }

}