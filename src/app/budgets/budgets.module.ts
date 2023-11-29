import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { BudgetsRoutingModule } from './budgets-routing.module';
import { BudgetsComponent } from './budgets.component';
import { TransferBudgetActionComponent } from './components/transfer-budget-action/transfer-budget-action.component';
import { BudgetBalanceReportComponent } from './components/budget-balance-report/budget-balance-report.component';


@NgModule({
  declarations: [
    BudgetsComponent,
    TransferBudgetActionComponent,
    BudgetBalanceReportComponent
  ],
  imports: [
    CommonModule,
    BudgetsRoutingModule
  ]
})
export class BudgetsModule { }
