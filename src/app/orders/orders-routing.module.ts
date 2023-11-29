import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { EditOrderComponent } from './components/edit-order/edit-order.component';
import { PrintOrderComponent } from './components/print-order/print-order.component';
import { SearchOrderComponent } from './components/search-order/search-order.component';
import { OrdersComponent } from './orders.component';

const routes: Routes = [
  { path: '', component: OrdersComponent, children: [
    { path: 'search', component: SearchOrderComponent}, 
    { path: 'print/:orderId', component: PrintOrderComponent }, 
    { path: 'edit', component: EditOrderComponent }, 
    { path: 'edit/:orderId', component: EditOrderComponent }
  ]}
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class OrdersRoutingModule { }
