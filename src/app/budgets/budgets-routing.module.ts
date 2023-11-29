import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { BudgetsComponent } from './budgets.component';
import { BudgetBalanceReportComponent } from './components/budget-balance-report/budget-balance-report.component';
import { TransferBudgetActionComponent } from './components/transfer-budget-action/transfer-budget-action.component';

const routes: Routes = [
  { path: '', component: BudgetsComponent, children: [
    {path: 'budget-balance-report', component: BudgetBalanceReportComponent }, 
    {path: 'transfer', component: TransferBudgetActionComponent }
  ]}
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class BudgetsRoutingModule { }
