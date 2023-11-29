import { Supplier } from "src/app/core/entities/supplier";

export function filterSuppliers(options: Supplier[], keyword: string): Supplier[] {
    if (!keyword) return [];

    if (typeof(keyword) !== 'string') return [];

    try {
        keyword = keyword.toLowerCase();
    } catch {
        console.log('keyword is: ', keyword);
    }

    return options
        .filter(option => option.supplierName.toLowerCase().includes(keyword)
                                ||  option.registerNum.toLowerCase().includes(keyword))
        .slice(0, 100);
}