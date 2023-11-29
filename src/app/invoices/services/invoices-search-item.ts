import {InvoiceForUpload} from "src/app/core/entities/invoice"

export interface InvoiceSearchItem extends InvoiceForUpload{
    isPrintable:boolean;
    isEditable:boolean;
    isUploaded:boolean;
}