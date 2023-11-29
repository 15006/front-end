import { EventEmitter, Input, Output, SimpleChanges } from '@angular/core';
import { Component, OnInit } from '@angular/core';
import { UntypedFormArray } from '@angular/forms';
import { OrderItemVm } from '@app/core/entities/order';
import { OrderDetail } from '@app/core/entities/order-detail';
import { OrdersService } from '@app/core/services/orders.service';
import { deepCloneArray } from '@app/shared/tools/clone';
import { Alert } from 'selenium-webdriver';
import { json } from 'stream/consumers';

@Component({
  selector: 'app-order-items-table',
  templateUrl: './order-items-table.component.html',
  styleUrls: ['./order-items-table.component.scss']
})
export class OrderItemsTableComponent implements OnInit {

  localFormArray: UntypedFormArray;
  @Input() items: OrderDetail[] = [];
  @Output() itemsChange = new EventEmitter<OrderDetail[]>();

  public dirty: boolean = false;
  sumTotal: number;
  isFinishDone: boolean = false;
  @Input()
  set formArray(value: UntypedFormArray) {
    this.localFormArray = value;
    console.log(this.localFormArray);
    this.getTotalCost()
  }

  @Output()
  addRow = new EventEmitter<void>();
  constructor(public orderService: OrdersService) { }

  ngOnInit(): void {
    // if(this.orderService.orderTable[0]){
    //   debugger
    //     this.finishOrder()
    // }
    this.addItem()
  }

  deleteRow(i: number) {
    this.localFormArray?.removeAt(i);
  }

  onAddRow() {
    this.addRow.emit();
  }
  ngOnChanges(changes: SimpleChanges) {
    const items = changes.items;
    this.items = deepCloneArray(this.orderService.orderTable);
  }
  deleteItem(itemNumber: OrderDetail) {
    this.orderService.finishOrder();
    // this.isFinishDone = true
    if (this.orderService.orderTable.length !== 1) {
      this.orderService.totalSum -= itemNumber.quantity * itemNumber.unitPrice;
      this.orderService.orderTable.splice(this.orderService.orderTable.map(function (element) { return element.itemId; })
        .indexOf(itemNumber.itemId), 1);
      this.orderService.orderTable = [...this.orderService.orderTable];
    }
    this.emitItems(true);
  }

  addItem() {
    //get max itemID
    this.orderService.flag=false;
    if (this.orderService.orderTable?.length > 0 && this.isFinishDone === false) {
      if (!this.orderService.editFlag)
        this.orderService.totalSum += this.orderService.orderTable[this.orderService.orderTable.length - 1].unitPrice * this.orderService.orderTable[this.orderService.orderTable.length - 1].quantity
      this.orderService.editFlag = false
    }
    const maxId = this.orderService.orderTable.reduce((acc, item) => item.itemId > acc ? item.itemId : acc, 0);
    this.orderService.orderTable.push({
      itemId: maxId + 1,
      unitPrice: 1,
      quantity: 0,
      orderDetailDescription: ''
    } as OrderDetail);
    this.orderService.orderTable = [...this.orderService.orderTable];
    this.emitItems(true);
  }

  getTotalCost() {
    if (this.items?.length) {
      console.log(this.items);
      this.orderService.totalSum += this.orderService.orderTable[this.items.length - 1].quantity * this.orderService.orderTable[this.items.length - 1].unitPrice
      // return this.orderService.orderTable.reduce((acc) => acc, 0);
      return this.orderService.totalSum;
    }
    return 0;
  }

  emitItems(hasInputChanged: boolean = false) {
    if (hasInputChanged) {
      this.dirty = true;
    }
    // this.orderService.orderTable.forEach(element => {
    //   // element.debtAmount = this.getCostIncludingVat(element);
    //   element.creditAmount = element.debtAmount;
    // });
    //  const beforeAction = this.orderService.orderTable.length===1
    // if (beforeAction) {
    //   this.orderService.totalSum = this.orderService.orderTable[0].unitPrice*this.orderService.orderTable[0].quantity
    // }
    // else {
    //   // this.orderService.totalSum += this.orderService.orderTable[index].unitPrice*this.orderService.orderTable[index].quantity
    // }
    this.itemsChange.emit(this.orderService.orderTable);
  }

  finishOrder() {
    //   this.orderService.totalSum = 0;
    //   // console.log(this.orderService.orderTable[this.orderService.orderTable.length - 1].unitPrice, "before");
    //  // this.orderService.orderTable.forEach(s.itemTotalSum=>this.orderService.totalSum+=sum)
    //  console.log("FINISH 11111",this.orderService.orderTable.length);

    //   for (let i = 0; i < this.orderService.orderTable.length-1; i++) {
    //     console.log("*******************************************");

    //     console.log(this.orderService.orderTable[i],this.orderService.totalSum);

    //        this.orderService.totalSum += this.orderService.orderTable[i].quantity * this.orderService.orderTable[i].unitPrice;
    //   }
    this.orderService.finishOrder()
    this.isFinishDone = true
    this.items = this.orderService.orderTable
  }
}
