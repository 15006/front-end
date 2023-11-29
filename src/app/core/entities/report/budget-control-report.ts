//import { of } from "rxjs";

export class BudgetControlReport{
    budgetId:number;
    budgetName: string;
    branchName:string;
    quarterBudget:number;
    month1:number;
    month2:number;
    month3:number;
    oderBalance:number;
    //orderBalance:number;
    previouslyBalance:number;
    balanceId:number;
    balanceName:string;
    schoolYearName : string;
    reportStartDate:Date;
    reportEndDate:Date;
}

export interface Branch{
    branchName:string;
    balances:Balance[];
    reportStartDate:Date;
    reportEndDate:Date;
    schoolYearName : string;
    quarterBudget:number;
    month1:number;
    month2:number;
    month3:number;
    oderBalance:number;
    //orderBalance:number;
    previouslyBalance:number;
}

export interface Balance{
    balanceId:number;
    balanceName:string;
    budgetControlReports:BudgetControlReport[];
    quarterBudget:number;
    month1:number;
    month2:number;
    month3:number;
    oderBalance:number;
    //orderBalance:number;
    previouslyBalance:number;
    
}

