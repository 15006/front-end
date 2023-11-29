import { SchoolYear } from "./school-year";

export class BudgetAction{
    budgetActionId?:number;
    cooperative: number;
    branch:number;
    budget:number;
    schoolYear:SchoolYear;
    year:string;
    fromQuarter:string;
    amount:number;
    budgetActionDetails:string;
    createdByUserId:number | null;
}

export class BudgetActionForm {
    branchId: number | null;
    budgetId: number | null;
    fromQuarterId: string | null;
    amount: number;
    budgetActionDetails: string;
}
