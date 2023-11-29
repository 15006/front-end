import { Order } from "src/app/core/entities/order";

export interface OrderSearchItem extends Order {
    isPrintable: boolean;
    isEditable: boolean;
    isCloseable: boolean;
}