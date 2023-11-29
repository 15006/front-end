//import * as internal from "stream";

import * as internal from "stream";

export interface InvoiceForUpload {

    invoiceId: string;
    invoiceNumber: string;
    supplierId: string;
    supplierName: string;
    description: string;
    createdDate: string;
    receptionDate: string;
    notes: string;
    receiver?: number;
    budgetName?: number;
    sumInvoice: number;
    sumInvoiceAction?: number;
    invoiceDigitalId: any;
    fileName: string;
    filePath: string;
    isTaxInvoice: number;
    invoiceActions?: InvoiceAction[];
    createdByEmployeeName?: string;
    matchId?:number;
    orderId?:number;
}

export interface InvoiceSearchForm {
    invoiceId?: number;
    packageId?: number;
    orderId?:number;
    supplier?:number;
    fromInvoiceStatus?:number;
    toInvoiceStatus?:number;
    snif?:number;
    invoiceNumber?:number;
}

export interface TaxInvoiceOptionForm {
    invoiceId: number;
    //fileSource:File;
    taxInvoiceOption?: number;
}

export interface InvocieAction {
    invoiceId: number;
    invoiceActionId: number;
    cooperativeId: number;
    cooperativeName: string;
    branchId: number;
    branchName: string;
    budgetId: number;
    budgetName: string;
    projectId?: number;
    projectNum?: number;
    projectName?: string;
    valueDate: Date;
    invoiceActionStatusId: number;
    invoiceActionDescription: string;
    invoiceActionNote: string;
    orderId?: number;
    invoiceNumber?: any;
    orderDate: Date;
    orderRequiredDate: Date;
    orderCreatedByEmployeeId: number;
    orderCreatedByEmployeeName: string;
    orderCreatedDate?: Date;
    orderUpdateByEmployeeId: number;
    orderUpdateByEmployeeName: string;
    orderUpdateDate?: number;
    orderLogNote: string;
    statusDate?: Date;
    special79Confirmation?: number;
    sumInvoiceAction: number;
    supplierName?: string;
    matchId?:number;
    invoiceDigitalId: any;
    InvoiceCreatedDate: Date;
}

export class InvoiceForPrint {
    invoiceId: string;
    invoiceNumber: string;
    supplierId: string;
    supplierName: string;
    description: string;
    createdDate: string;
    receptionDate: string;
    notes: string; 
    receiver?: number;
    sumInvoice: number;
    invoiceDigitalId: string;
    fileName: string;
    filePath: string;
    isTaxInvoice: number;
    invoiceAction: InvoiceAction[];
    createdByEmployeeName: string;
    matchId?:number;

}
export class InvoiceCenteralizedForPrint {
    invoiceId: string;
    invoiceActionId: number;
    invoiceNumber: string;
    branchId: string;
    branchName: string;
    supplierId: string;
    supplierName: string;
    invoiceDescription: string;
    invoiceCreatedDate: Date;
    valueDate:Date;
    sumInvoiceAction: number;
    budgetId:string;
    budgetName:string;   

}
export class Invoice {
    invoiceId: string;
    invoiceNumber: string;
    createdDate: string;
    receptionDate: string;
    supplierId: string;
    supplierName: string;
    invoiceDescription: string;
    invoiceNote: string;
    invoiceActions: InvocieAction[];
    matchId?:number;

}

export class InvoiceAction {
    invoiceId: number;
    invoiceActionId: number;
    cooperativeId: number;
    cooperativeName: string;
    branchId: number;
    branchName: number;
    budgetId: number;
    debtAccountId?:number;
    budgetName: string;
    projectId?: number;
    projectNum?: number;
    projectName?: string;
    valueDate?: Date;
    invoiceActionStatusId: number;
    invoiceActionStatusName: string;
    description: string;
    invoiceActionNotes: string;
    orderId: number;
    orderDate: Date;
    orderRequiredDate: Date;
    orderCreatedByEmployeeId: number;
    orderCreatedByEmployeeName: string;
    orderCreatedDate: number;
    orderUpdateByEmployeeId: number;
    orderUpdateByEmployeeName: string;
    orderUpdateDate: Date;
    orderLogNote: string;
    statusDate: Date;
    special79Confirmation: number;
    sumInvoiceAction: number;
    matchId?:number;
    invoiceNumber?: any;
    supplierName?: string;
    invoiceDigitalId: any;
}

export class InvoiceForm {
    invoiceId?: number;
    invoiceNumber: string;
    createDate: string;
    supplierId: number;
    receptionDate: string;
    invoiceDescription: string;
    invoiceNote: string;
    createdByEmployeeId: number;
    invoiceActions: InvoiceActionForm[];
    matchId?:number;
    receiver?: number;


}

export class InvoiceActionForm {
    invoiceId?: number;
    invoiceActionId: number;
    //cooperativeId : number;
    branchId: number;
    budgetId: number;
    projectId?: number;
    valueDate?: string;
    invoiceActionStatusId: number;
    invoiceActionDescription: string;
    description: string;
    orderId: number;
    //orderDate : Date;
    orderCreatedByEmployeeId: number;
    // orderCreatedByEmployeeName : string;
    // orderCreatedDate : number;
    //orderUpdateByEmployeeId : number;
    // orderUpdateByEmployeeName : string;
    //  orderUpdateDate : Date;
    //  orderLogNote : string;
    statusDate: string;
   matchId?:number;

    // special79Confirmation : number;
    // sumInvoiceAction : number;
}

export interface TaxInvoiceOption {
    taxInvoiceOptionId: number;
    taxInvoiceOptionDesc: string;
}

export interface InvoiceActionStatus {
    invoiceActionStatusId: number;
    invoiceActionStatus: string;
}

export interface InvoiceVm {
    invoiceId?: number;
    invoiceNumber: string;
    supplierId?: number;
    supplierName: string;
    description: string;
    createdDate: string;
    receptionDate: string;
    notes: string;
    sumInvoice: number;
    invoiceDigitalId: number;
    fileName: string;
    filePath: string;
    isTaxInvoice?: number;
    invoiceActions: InvoiceActionVm[];
    createdByEmployeeId: number;
    receiver?: number;
    matchId?:number;

}
export interface InvoiceItemVm {
    invoiceID: number;
    invoiceActionID: number;
    itemID: number;
    orderItemID: number;
    productID: number;
    unitPrice: number;
    quantity: number;
    debtAmount: number;
    creditAmount: number | null;
    description: string;
}
export interface InvoiceActionVm {
    invoiceId?: number;
    invoiceActionId: number;
    orderId: number;
    branchId: number;
    valueDate: string;
    orderDate: string;
    description: string;
    budgetId: number;
    projectId: number;
    projectNum: number;
    invoiceActionStatusId: number;
    createdBy: number;
    items: InvoiceItemVm[];
}

