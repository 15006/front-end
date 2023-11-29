export interface SchoolYear {
    readonly schoolYearId: number;
    readonly schoolYearName: string;
    readonly startYear: Date;
    readonly quarter2: Date;
    readonly quarter3: Date;
    readonly quarter4: Date;
    readonly endYear: Date;
    readonly visible: number;
}