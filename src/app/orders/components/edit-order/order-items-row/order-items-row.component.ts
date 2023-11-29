import { Component, EventEmitter, Input, OnInit, Output, SimpleChanges } from '@angular/core';
import { UntypedFormGroup } from '@angular/forms';
import { OrdersService } from '@app/core/services/orders.service';
import { DEFAULT_ITEMS } from '@app/invoices/components/edit-invoice/invoice/invoice-action-content/invoice-action-content.component';
import { OrdersDataSourceService } from '@app/orders/services/orders-data-source.service';
import { deepCloneArray } from '@app/shared/tools/clone';

@Component({
  selector: 'tr[app-order-items-row]',
  templateUrl: './order-items-row.component.html',
  styleUrls: ['./order-items-row.component.scss']
})
export class OrderItemsRowComponent implements OnInit {


  localGroup: UntypedFormGroup;
  localIndex: number;
  items: any[];
  @Input()
  set group(value: UntypedFormGroup) {
    this.localGroup = value;
    if (this.localGroup.controls.quantity.parent.parent.value.length > 1) {
      console.log(this.localGroup.controls.quantity.parent.parent.value[this.localGroup.controls.quantity.parent.parent.value.length - 2])
      console.log(this.localGroup.controls.quantity.parent.parent.value[this.localGroup.controls.quantity.parent.parent.value.length - 2])
      this.orderService.totalSum = this.orderService.totalSum + (this.localGroup.controls.quantity.parent.parent.value[this.localGroup.controls.quantity.parent.parent.value.length - 2].quantity * this.localGroup.controls.unitPrice.parent.parent.value[this.localGroup.controls.unitPrice.parent.parent.value.length - 2].unitPrice);
      console.log(this.orderService.totalSum + '   total sum');
      this.orderService.index
      this.orderService.index
    }
    console.log('group = ', this.localGroup, 'index = ', this.localIndex);
  }

  @Input()
  set index(value: number) {
    this.localIndex = value;
    console.log('group = ', this.localGroup, 'index = ', this.localIndex);
  }

  @Output()
  deleteRow = new EventEmitter<void>();



  constructor(
    public orderService: OrdersService
  ) { }

  ngOnInit(): void {
  }

  onDeleteRow() {
    this.deleteRow.emit();
  }

  // unitPrice(unitPrice: number) {
  //   console.log(unitPrice)
  //   this.orderService.unitPrice = unitPrice
  // }

  // quantity(quantity: number) {
  //   console.log(quantity)
  //   this.orderService.quantity = quantity
  // }


  ngOnChanges(changes: SimpleChanges) {
    const items = changes.items;
    // this.orderService.orderTable = items.currentValue//|| (DEFAULT_ITEMS as OrderItemVm[]);
    this.items = deepCloneArray(this.orderService.orderTable);
  }

  // deleteItem(item: OrderItemVm) {
  //   this.orderService.orderTable.splice(this.orderService.orderTable.indexOf(item), 1);
  //   this.orderService.orderTable = [...this.orderService.orderTable];
  //   // this.emitItems(true);
  // }

  // addItem() {
  //   //get max itemID
  //   const maxId = this.orderService.orderTable.reduce((acc, item) => item.index > acc ? item.index : acc, 0);
  //   this.orderService.orderTable.push({
  //     index: maxId + 1,
  //     unitPrice: 0,
  //     quantity: 1,
  //   } as OrderItemVm);
  //   this.orderService.orderTable = [...this.orderService.orderTable];
  //   // this.emitItems(true);
  // }

}
