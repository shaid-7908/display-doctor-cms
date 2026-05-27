import { Global, Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Invoice, InvoiceSchema } from '../schemas/invoice.schema';
import { InvoiceRepository } from './invoice.repository';

@Global()
@Module({
    imports: [
        MongooseModule.forFeatureAsync([
            {
                name: Invoice.name,
                useFactory: () => {
                    const schema = InvoiceSchema;
                    return schema;
                }
            }
        ])
    ],
    controllers: [],
    providers: [InvoiceRepository],
    exports: [InvoiceRepository]
})
export class InvoiceRepositoryModule {}
