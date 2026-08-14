import { Injectable, NotFoundException } from '@nestjs/common';
import { InvoiceRepository } from './repositories/invoice.repository';
import { CreateInvoiceDto, InvoiceListingDto, UpdateInvoiceDto } from './dto/invoice.dto';
import { UserDocument } from '@modules/users/schemas/user.schema';
import { ConfigService } from '@nestjs/config';
import puppeteer from 'puppeteer';
import { IssueRepository } from '@modules/issue/repositories';
import { Types } from 'mongoose';
import { IssueStatus } from '@common/enum/issue.status.enum';
import { SettingsRepository } from '@modules/settings/repository/settings.repository';

@Injectable()
export class InvoiceService {
    constructor(
        private readonly invoiceRepository: InvoiceRepository,
        private readonly configService: ConfigService ,
        private readonly issueRepo:IssueRepository,
        private readonly settingsRepo: SettingsRepository
    ) {}

    async create(createInvoiceDto: CreateInvoiceDto , user:Partial<UserDocument>) {
        const issue = await this.issueRepo.getByField({_id:new Types.ObjectId(createInvoiceDto.issue_id.toString()),isDeleted:false})
        if(!issue) throw new NotFoundException('Issue not found');
        if(!issue.technician_id) throw new NotFoundException('Issue not assigned to any technician');
        if (createInvoiceDto.warranty && createInvoiceDto.warranty > 0) {
            const start = new Date();
            const end = new Date();
            end.setMonth(end.getMonth() + createInvoiceDto.warranty);
            createInvoiceDto.warranty_start_date = start;
            createInvoiceDto.warranty_end_date = end;
        } else {
            createInvoiceDto.warranty_start_date = null;
            createInvoiceDto.warranty_end_date = null;
        }
        createInvoiceDto.createdBy = user?._id.toString();
        createInvoiceDto.assigendTo = issue.technician_id?.toString() || null;
        await this.issueRepo.updateById({status:IssueStatus.INVOICE_GENERATED},issue._id)
        return await this.invoiceRepository.save(createInvoiceDto);
    }

    async findAll(query: InvoiceListingDto) {
        return await this.invoiceRepository.getAllPaginate(query);
    }

    async findOne(id: string) {
        const invoice = await this.invoiceRepository.getByIdPopulated(id);
        if (!invoice || invoice.isDeleted) {
            throw new NotFoundException('Invoice not found');
        }
        return invoice;
    }

    async update(id: string, updateInvoiceDto: UpdateInvoiceDto) {
        await this.findOne(id);
        if (updateInvoiceDto.warranty !== undefined) {
            if (updateInvoiceDto.warranty > 0) {
                const start = new Date();
                const end = new Date();
                end.setMonth(end.getMonth() + updateInvoiceDto.warranty);
                updateInvoiceDto.warranty_start_date = start;
                updateInvoiceDto.warranty_end_date = end;
            } else {
                updateInvoiceDto.warranty_start_date = null;
                updateInvoiceDto.warranty_end_date = null;
            }
        }
        return await this.invoiceRepository.updateById(updateInvoiceDto,id);
    }

    async remove(id: string) {
        await this.findOne(id);
        return await this.invoiceRepository.updateById({ isDeleted: true },id);
    }

    async generatePdf(id: string): Promise<Buffer> {
        const invoice = await this.findOne(id);
        const settings= await this.settingsRepo.getByField({isDeleted:false})
        const populatedInvoice = await invoice.populate(['issue_id', 'assigendTo']) as any;
        
        const invoiceObj = {
            ...populatedInvoice.toObject(),
            issue: populatedInvoice.issue_id as any
        };
        //console.log(invoiceObj)
        const projectName = this.configService.get('PROJECT_NAME') || 'Display Doctor';

        const itemsHtml = (invoiceObj.items && invoiceObj.items.length > 0)
            ? invoiceObj.items.map((item: any) => `
                <tr>
                    <td style="font-weight: 600; color: #2d3748; padding: 12px 16px; border-bottom: 1px solid #edf2f7; text-align: left;">${item.part_name || '-'}</td>
                    <td style="color: #718096; padding: 12px 16px; border-bottom: 1px solid #edf2f7; text-align: left;">${item.part_description || '-'}</td>
                    <td style="text-align: right; font-weight: 600; color: #2d3748; padding: 12px 16px; border-bottom: 1px solid #edf2f7;">₹${(item.part_avg_price || 0).toFixed(2)}</td>
                </tr>
            `).join('')
            : `
                <tr>
                    <td colspan="3" style="text-align: center; color: #a0aec0; padding: 20px; border-bottom: 1px solid #edf2f7;">No items billed.</td>
                </tr>
            `;

        let emailRow = '';
        if (invoiceObj.issue && invoiceObj.issue.customer_email) {
            emailRow = `
                <tr>
                    <td style="color: #718096; width: 24px; padding: 4px 0; vertical-align: middle;">
                        <svg viewBox="0 0 24 24" width="12" height="12" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                            <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path>
                            <polyline points="22,6 12,13 2,6"></polyline>
                        </svg>
                    </td>
                    <td style="padding: 4px 0; vertical-align: middle; color: #4a5568;">${invoiceObj.issue.customer_email}</td>
                </tr>
            `;
        }

        let addressRow = '';
        if (invoiceObj.issue && invoiceObj.issue.customer_address) {
            addressRow = `
                <tr>
                    <td style="color: #718096; width: 24px; padding: 4px 0; vertical-align: top;">
                        <svg viewBox="0 0 24 24" width="12" height="12" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="margin-top: 3px;">
                            <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
                            <circle cx="12" cy="10" r="3"></circle>
                        </svg>
                    </td>
                    <td style="padding: 4px 0; vertical-align: top; color: #4a5568;">
                        ${invoiceObj.issue.customer_address}${invoiceObj.issue.customer_pincode ? ` - ${invoiceObj.issue.customer_pincode}` : ''}
                    </td>
                </tr>
            `;
        }

        let warrantyHtml = '';
        if (invoiceObj.warranty && invoiceObj.warranty > 0) {
            warrantyHtml = `
                <tr>
                    <th style="text-align: right; color: #718096; font-weight: 500; padding: 4px 12px 4px 0; font-size: 13px;">Warranty</th>
                    <td style="text-align: left; font-weight: 700; color: #38a169; padding: 4px 0; font-size: 13px;">${invoiceObj.warranty} Month(s)</td>
                </tr>
            `;
            if (invoiceObj.warranty_start_date && invoiceObj.warranty_end_date) {
                const startStr = new Date(invoiceObj.warranty_start_date).toLocaleDateString();
                const endStr = new Date(invoiceObj.warranty_end_date).toLocaleDateString();
                warrantyHtml += `
                    <tr>
                        <th style="text-align: right; color: #718096; font-weight: 500; padding: 4px 12px 4px 0; font-size: 13px;">Warranty Period</th>
                        <td style="text-align: left; color: #718096; padding: 4px 0; font-size: 12px;">${startStr} to ${endStr}</td>
                    </tr>
                `;
            }
        } else {
            warrantyHtml = `
                <tr>
                    <th style="text-align: right; color: #718096; font-weight: 500; padding: 4px 12px 4px 0; font-size: 13px;">Warranty</th>
                    <td style="text-align: left; color: #718096; padding: 4px 0; font-size: 13px;">No Warranty</td>
                </tr>
            `;
        }

        let technicianHtml = '';
        if (invoiceObj.assigendTo) {
            technicianHtml = `
                <tr>
                    <th style="text-align: right; color: #718096; font-weight: 500; padding: 4px 12px 4px 0; font-size: 13px;">Technician</th>
                    <td style="text-align: left; font-weight: 600; color: #2d3748; padding: 4px 0; font-size: 13px;">
                        ${invoiceObj.assigendTo.fullName || '-'}
                        ${invoiceObj.assigendTo.phone ? `<br><span style="font-weight: normal; color: #718096; font-size: 12px;">📞 ${invoiceObj.assigendTo.phone}</span>` : ''}
                    </td>
                </tr>
            `;
        }

        const discountRow = (invoiceObj.discount_amount && invoiceObj.discount_amount > 0)
            ? `
                <tr>
                    <td style="text-align: right; color: #e53e3e; padding: 6px 0; font-size: 14px;">Discount</td>
                    <td style="text-align: right; font-weight: 600; color: #e53e3e; padding: 6px 0 6px 16px; font-size: 14px;">-₹${invoiceObj.discount_amount.toFixed(2)}</td>
                </tr>
            `
            : '';

        let statusClass = 'status-pending';
        if (invoiceObj.status === 'PAID') {
            statusClass = 'status-paid';
        } else if (invoiceObj.status === 'CANCELLED') {
            statusClass = 'status-cancelled';
        }

        const html = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="utf-8">
    <title>Invoice ${invoiceObj.invoice_number}</title>
    <style>
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&display=swap');
        
        body {
            background-color: #ffffff;
            color: #2d3748;
            font-family: 'Inter', sans-serif;
            margin: 0;
            padding: 0;
            -webkit-print-color-adjust: exact;
        }

        .invoice-box {
            max-width: 800px;
            margin: 0 auto;
            padding: 40px;
            background-color: #ffffff;
        }

        .invoice-header {
            display: flex;
            justify-content: space-between;
            align-items: flex-start;
            border-bottom: 2px solid #edf2f7;
            padding-bottom: 24px;
            margin-bottom: 24px;
        }

        .company-logo-section {
            display: flex;
            flex-direction: column;
        }

        .company-logo {
            display: flex;
            align-items: center;
            font-size: 24px;
            font-weight: 800;
            color: #3182ce;
            text-transform: uppercase;
            letter-spacing: 0.5px;
        }

        .company-logo img {
            max-height: 50px;
            width: auto;
            object-fit: contain;
        }

        .company-subtitle {
            font-size: 12px;
            color: #718096;
            margin-top: 4px;
        }

        .company-address {
            font-size: 12px;
            color: #718096;
            margin-top: 4px;
            line-height: 1.4;
        }

        .invoice-title-section {
            text-align: right;
        }

        .invoice-title {
            font-size: 32px;
            font-weight: 700;
            color: #2d3748;
            margin: 0;
            letter-spacing: -0.5px;
        }

        .invoice-number {
            font-size: 16px;
            font-weight: 600;
            color: #4a5568;
            margin-top: 4px;
        }

        .invoice-date {
            font-size: 13px;
            color: #718096;
            margin-top: 2px;
        }

        .info-grid {
            display: flex;
            justify-content: space-between;
            gap: 40px;
            margin-bottom: 32px;
        }

        .info-col {
            flex: 1;
        }

        .info-section-title {
            font-size: 12px;
            font-weight: 700;
            color: #3182ce;
            text-transform: uppercase;
            letter-spacing: 1px;
            margin-bottom: 12px;
            border-bottom: 1px solid #edf2f7;
            padding-bottom: 6px;
        }

        .details-table {
            width: 100%;
            border-collapse: collapse;
        }

        .details-table td {
            padding: 4px 0;
            font-size: 13px;
            line-height: 1.5;
        }

        .details-table th {
            font-size: 13px;
            color: #718096;
            font-weight: normal;
            text-align: right;
            padding-right: 12px;
        }

        .status-badge {
            display: inline-block;
            font-size: 11px;
            font-weight: 700;
            padding: 4px 12px;
            border-radius: 9999px;
            text-transform: uppercase;
            letter-spacing: 0.5px;
        }

        .status-paid {
            background-color: #c6f6d5;
            color: #22543d;
        }

        .status-pending {
            background-color: #feebc8;
            color: #744210;
        }

        .status-cancelled {
            background-color: #fed7d7;
            color: #742a2a;
        }

        .items-table {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 32px;
        }

        .items-table th {
            background-color: #f7fafc;
            color: #4a5568;
            font-weight: 700;
            font-size: 12px;
            text-transform: uppercase;
            letter-spacing: 0.5px;
            border-bottom: 2px solid #edf2f7;
            padding: 12px 16px;
            text-align: left;
        }

        .items-table td {
            border-bottom: 1px solid #edf2f7;
            padding: 16px;
            font-size: 14px;
            color: #2d3748;
        }

        .items-table tr:nth-child(even) {
            background-color: #f7fafc;
        }

        .financial-grid {
            display: flex;
            justify-content: space-between;
            gap: 40px;
            align-items: flex-end;
        }

        .terms-col {
            flex: 1.2;
        }

        .totals-col {
            flex: 0.8;
        }

        .terms-box {
            border: 1px solid #edf2f7;
            background-color: #f7fafc;
            border-radius: 8px;
            padding: 16px;
            font-size: 12px;
            color: #718096;
            line-height: 1.6;
        }

        .terms-title {
            font-weight: 700;
            color: #2d3748;
            margin-bottom: 8px;
            font-size: 13px;
        }

        .totals-table {
            width: 100%;
            border-collapse: collapse;
        }

        .totals-table td {
            padding: 6px 0;
            font-size: 14px;
            color: #4a5568;
        }

        .grand-total-row td {
            border-top: 2px solid #edf2f7;
            padding-top: 12px;
            margin-top: 8px;
        }

        .grand-total-label {
            font-size: 18px;
            font-weight: 700;
            color: #2d3748;
        }

        .grand-total-amount {
            font-size: 20px;
            font-weight: 800;
            color: #3182ce;
        }

        .footer {
            text-align: center;
            margin-top: 48px;
            padding-top: 24px;
            border-top: 1px solid #edf2f7;
            font-size: 13px;
            color: #a0aec0;
        }
    </style>
</head>
<body>
    <div class="invoice-box">
        <!-- Header -->
        <div class="invoice-header">
            <div class="company-logo-section">
                <div class="company-logo">
                    <img src ="${settings?.siteLogo}" alt="Display Doctor" />
                </div>
                <div class="company-subtitle">
                    Professional Device Repair & Maintenance Services
                </div>
                <div class="company-address">
                    ${settings?.invoiceAddress || 'Display Doctor'}
                </div>
            </div>
            <div class="invoice-title-section">
                <h1 class="invoice-title">INVOICE</h1>
                <div class="invoice-number">#${invoiceObj.invoice_number}</div>
                <div class="invoice-date">Date: ${new Date(invoiceObj.createdAt).toLocaleDateString()}</div>
            </div>
        </div>

        <!-- Billing Info Row -->
        <div class="info-grid">
            <div class="info-col">
                <h2 class="info-section-title">Customer Details</h2>
                <table class="details-table">
                    <tbody>
                        <tr>
                            <td colspan="2" style="font-weight: 700; color: #2d3748; font-size: 15px; padding-bottom: 6px;">
                                ${invoiceObj.issue ? invoiceObj.issue.customer_name : '-'}
                            </td>
                        </tr>
                        <tr>
                            <td style="color: #718096; width: 24px; padding: 4px 0; vertical-align: middle;">
                                <svg viewBox="0 0 24 24" width="12" height="12" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                                    <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path>
                                </svg>
                            </td>
                            <td style="padding: 4px 0; vertical-align: middle; color: #4a5568;">
                                ${invoiceObj.issue ? invoiceObj.issue.customer_phone : '-'}
                            </td>
                        </tr>
                        ${emailRow}
                        ${addressRow}
                    </tbody>
                </table>
            </div>
            
            <div class="info-col">
                <h2 class="info-section-title" style="text-align: right; padding-right: 0;">Invoice Summary</h2>
                <table class="details-table" style="margin-left: auto; width: auto;">
                    <tbody>
                        <tr>
                            <th style="text-align: right; color: #718096; font-weight: 500; padding: 4px 12px 4px 0; font-size: 13px;">Issue Ticket #</th>
                            <td style="text-align: left; font-weight: 600; color: #2d3748; padding: 4px 0; font-size: 13px;">
                                ${invoiceObj.issue ? '#' + invoiceObj.issue.ticket_number : '-'}
                            </td>
                        </tr>
                        <tr>
                            <th style="text-align: right; color: #718096; font-weight: 500; padding: 4px 12px 4px 0; font-size: 13px;">Status</th>
                            <td style="text-align: left; padding: 4px 0;">
                                <span class="status-badge ${statusClass}">
                                    ${invoiceObj.status}
                                </span>
                            </td>
                        </tr>
                        ${warrantyHtml}
                        ${technicianHtml}
                    </tbody>
                </table>
            </div>
        </div>

        <!-- Items Table -->
        <table class="items-table">
            <thead>
                <tr>
                    <th style="text-align: left; width: 40%;">Item / Part Name</th>
                    <th style="text-align: left; width: 40%;">Description</th>
                    <th style="text-align: right; width: 20%;">Amount</th>
                </tr>
            </thead>
            <tbody>
                ${itemsHtml}
            </tbody>
        </table>

        <!-- Financial Section -->
        <div class="financial-grid">
            <div class="terms-col">
                <div class="terms-box">
                    <div class="terms-title">Terms & Conditions</div>
                    1. Warranty is only applicable on parts replaced.<br>
                    2. Warranty claims require presenting this invoice.<br>
                    3. Physical damage or water damage voids any warranty.
                </div>
            </div>
            <div class="totals-col">
                <table class="totals-table">
                    <tbody>
                        <tr>
                            <td style="text-align: right; color: #718096; padding: 4px 0; font-size: 14px;">Sub Total</td>
                            <td style="text-align: right; font-weight: 600; color: #2d3748; padding: 4px 0 4px 16px; font-size: 14px;">₹${(invoiceObj.sub_total || 0).toFixed(2)}</td>
                        </tr>
                        <tr>
                            <td style="text-align: right; color: #718096; padding: 4px 0; font-size: 14px;">Service Charges</td>
                            <td style="text-align: right; color: #2d3748; padding: 4px 0 4px 16px; font-size: 14px;">₹${(invoiceObj.service_charges || 0).toFixed(2)}</td>
                        </tr>
                        <tr>
                            <td style="text-align: right; color: #718096; padding: 4px 0; font-size: 14px;">Visiting Charges</td>
                            <td style="text-align: right; color: #2d3748; padding: 4px 0 4px 16px; font-size: 14px;">₹${(invoiceObj.visiting_charge || 0).toFixed(2)}</td>
                        </tr>
                        ${discountRow}
                        <tr class="grand-total-row">
                            <td class="grand-total-label" style="text-align: right; padding: 12px 0 0 0;">Grand Total</td>
                            <td class="grand-total-amount" style="text-align: right; padding: 12px 0 0 16px;">₹${(invoiceObj.total_amount || 0).toFixed(2)}</td>
                        </tr>
                    </tbody>
                </table>
            </div>
        </div>

        <!-- Footer -->
        <div class="footer">
            Thank you for choosing <strong>${projectName}</strong>! We value your business.
        </div>
    </div>
</body>
</html>
        `;

        // Launch puppeteer
        const browser = await puppeteer.launch({
            headless: true,
            args: ['--no-sandbox', '--disable-setuid-sandbox']
        });
        
        const page = await browser.newPage();
        await page.setContent(html, { waitUntil: 'load' });
        
        // Print to PDF
        const pdfBuffer = await page.pdf({
            format: 'A4',
            printBackground: true,
            margin: {
                top: '20px',
                right: '20px',
                bottom: '20px',
                left: '20px'
            }
        });

        await browser.close();
        return Buffer.from(pdfBuffer);
    }
}
