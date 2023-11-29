export interface User {
    readonly userId: number;
    readonly lastName: string;
    readonly firstName: string;
    readonly email: string;
    readonly branchId: number;
    readonly branchName: string;
    readonly roleId: number;
    readonly isReshetUser: number;
    readonly isAllowAllBranches: number;
    readonly isAllowAllBudgets: number;
    readonly isAllowOrderWithPastRequiredDate: number;
    readonly isAllowSetOrderForAllStatuses: number;
}

