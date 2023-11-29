import {Invoice, TaxInvoiceOption} from "src/app/core/entities/invoice"

export interface TaxInvoiceOptionMark extends TaxInvoiceOption{
    isChacked:boolean;
}