import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { OrdersRoutingModule } from './orders-routing.module';
import { OrdersComponent } from './orders.component';
import { SearchOrderComponent } from './components/search-order/search-order.component';
import { EditOrderComponent } from './components/edit-order/edit-order.component';
import { PrintOrderComponent } from './components/print-order/print-order.component';
import { SharedModule } from '../shared/shared.module';
import { SearchResultsComponent } from './components/search-order/search-results/search-results.component';
import { OrderItemsTableComponent } from './components/edit-order/order-items-table/order-items-table.component';
import { OrderItemsRowComponent } from './components/edit-order/order-items-row/order-items-row.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

@NgModule({
  declarations: [
    OrdersComponent,
    SearchOrderComponent,
    EditOrderComponent,
    PrintOrderComponent,
    SearchResultsComponent,
    OrderItemsTableComponent,
    OrderItemsRowComponent
  ],
  imports: [
    CommonModule,
    SharedModule,
    OrdersRoutingModule,
    FormsModule,
    ReactiveFormsModule
  ]
})
export class OrdersModule { }
