export interface Budget {
    readonly budgetId: number;
    readonly budgetName: string;
    readonly branchId: number;
    readonly branchName: string;
    readonly cooperativeId: number;
    readonly cooperativeName: string;
    readonly flex: number;
    readonly reportToSnif: number;
    readonly planMust: number;
}