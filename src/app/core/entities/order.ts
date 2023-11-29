import { Observable } from "rxjs";
import { OrderDetail } from "./order-detail";
import { Supplier } from "./supplier";

export interface Order {
    readonly orderId: number;
    readonly branchId: number;
    readonly branchName: string;
    readonly budgetId: number;
    readonly budgetName: string;
    readonly projectId: number;
    readonly projectName: string;
    readonly supplierId: number;
    readonly supplierName: string;
    readonly orderDate: string;
    readonly requiredDate: string;
    readonly orderDescription: string;
    readonly orderStatusId: number;
    readonly orderStatusDescription: string;
    readonly orderBalance: number;
    readonly orderTotal: number;
 }

export interface OrderVm {
    orderId?: number;
    requiredDate?: string;
    cooperativeId?: number;
    branchId?: number;
    budgetId?: number;
    projectId?: number;
    supplierId?: number;
    orderStatusId?: number;
    orderDescription?: string;
    orderDetails?: OrderDetail[];
    isSetStatusMode?: boolean;
    doneBy?: number;
}

export interface OrderItemVm{
    index?:number;
    description?:string;
    quantity?:number;
    unitPrice:number;
    itemTotalsum:number;
}

export interface OrderForm {
    orderId?: number;
    orderStatusId: number;
    requiredDate: string;
    branchId: number;
    budgetId: number;
    projectId: number;
    supplierId: number;
    orderDescription: string;
    orderDetails?: OrderDetail[];
    isSetStatusMode: boolean;
}

export interface OrderSearchForm {
    orderId?: number;
    schoolYearId?: number;
    fromDate?: string;
    toDate?: string;
    branchId?: number;
    budgetId?: number;
    projectId?: number;
    supplierId?: number;
    orderStatusId?: number;
    fromOrderSum: number;
    toOrderSum: number;
    fromOrderStatusId: number;
    toOrderStatusId: number;
}

export interface OrderToPrint {
    orderId: number;
    cooperativeId: number;
    cooperativeName: string;
    branchId: number;
    branchName: string;
    branchAddress: string;
    branchPhoneNumber: string;
    budgetId: number;
    budgetName: string;
    projectId: number;
    projectName: string;
    supplierId: number;
    supplierName: string;
    supplierAddress: string;
    supplierCity: string;
    supplierZipCode: string;
    supplierPhone: string;
    supplierFax: string;
    orderDate: string;
    requiredDate: string;
    orderStatusId: number;
    orderStatusDescription: string;
    orderDescription: string;
    orderDetails?: OrderDetail[];
    createdByUserId: number;
    createdByUserName: string;
}
