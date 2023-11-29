export interface Project {
    readonly projectId: number;
    readonly projectNum: number;
    readonly projectName: string;
    readonly budgetId: number;
    readonly budgetName:string;
    readonly schoolYearId: number;
    readonly schoolYearName: string;
    readonly comments: string;
    readonly currentProject: number; 
    readonly ordered: number;
}