import { User } from './user'
import { Branch } from './branch'
import { Budget } from './budget'
import { SchoolYear } from './school-year'
import { Quarter } from './quarter'
import { Cooperative } from './Cooperative';
import { Project } from './project'
import { Supplier } from './supplier'
import { OrderStatus } from './order-status'
import { InvoiceActionStatus } from './invoice'

export interface ZnCtrMetaData{
    readonly dataBaseId : string;
    readonly user: User;
    readonly cooperatives: Cooperative[];
    readonly branches: Branch[];
    readonly budgets: Budget[];
    readonly projects: Project[];
    readonly schoolYear: SchoolYear[];
    readonly quarters: Quarter[];
    readonly suppliers: Supplier[];
    readonly employees: User[];
    readonly currentSchoolYear: SchoolYear;
    readonly allOrderStatuses: OrderStatus[];
    readonly budgetPrecedeCommission: number;
    readonly actionStatuses: InvoiceActionStatus[];
    readonly maam: number;
}
