import { Component, Input, OnInit, Output, EventEmitter, SimpleChanges, AfterViewInit } from '@angular/core';
import { InvoiceItemVm } from '@app/core/entities/invoice';
import { InvoiceStateService } from '@app/core/services/invoice-state.service';
import { MetadataService } from '@app/core/services/metadata.service';
import { deepCloneArray } from '@app/shared/tools/clone';
import { map } from 'rxjs/operators';
import { DEFAULT_ITEMS } from '../invoice-action-content/invoice-action-content.component';

@Component({
  selector: 'app-invoice-action-items',
  templateUrl: './invoice-action-items.component.html',
  styleUrls: ['./invoice-action-items.component.scss']
})
export class InvoiceActionItemsComponent implements OnInit, AfterViewInit {
  @Input() items: InvoiceItemVm[] = [];
  @Output() itemsChange = new EventEmitter<InvoiceItemVm[]>();

  editableItems: InvoiceItemVm[] = [];
  vat: number = .17;
  public dirty: boolean = false;
  // vatIncluded: boolean = true;
  constructor(private metadataService: MetadataService,
    private invoiceState: InvoiceStateService) { }
  displayedColumns: string[] = ['actions', 'description', 'quantity', 'unitPrice', 'total',];
  ngOnInit(): void {
    this.editableItems = deepCloneArray(this.items);
    if (!this.editableItems || !this.editableItems.length) {
      this.editableItems = DEFAULT_ITEMS as InvoiceItemVm[];
    }
    this.metadataService.getMaam().subscribe(
      maam => {
        // this.itemsChange.emit(this.editableItems);
        this.vat = maam;
      });
  }

  get vatIncluded() {
    return this.invoiceState.vatIncluded;
  }
  set vatIncluded(value: boolean) {
    this.invoiceState.vatIncluded = value;
  }

  onVatChange() {
    this.editableItems.forEach(element => {
      element.unitPrice = !this.vatIncluded ? element.unitPrice / (1 + this.vat) : element.unitPrice * (1 + this.vat);
    });
    this.emitItems();
  }

  ngAfterViewInit(): void {
    setTimeout(() => {
      this.emitItems();
    }, 1500);
  }

  ngOnChanges(changes: SimpleChanges) {
    const items = changes.items;
    this.editableItems = items.currentValue || (DEFAULT_ITEMS as InvoiceItemVm[]);
    this.items = deepCloneArray(this.editableItems);
  }

  deleteItem(item: InvoiceItemVm) {
    this.editableItems.splice(this.editableItems.indexOf(item), 1);
    this.editableItems = [...this.editableItems];
    this.emitItems(true);
  }

  addItem() {
    //get max itemID
    const maxId = this.editableItems.reduce((acc, item) => item.itemID > acc ? item.itemID : acc, 0);
    this.editableItems.push({
      itemID: maxId + 1,
      unitPrice: 0,
      quantity: 1,
    } as InvoiceItemVm);
    this.editableItems = [...this.editableItems];
    this.emitItems(true);
  }

  getCostIncludingVat(item: InvoiceItemVm, hasVat: boolean = this.vatIncluded) {
    if (!item.quantity || !item.unitPrice)
      return 0;
    return ((item.quantity * item.unitPrice) * (1 + (hasVat ? 0 : this.vat))) || 0;
  }

  getTotalCost() {
    if (this.items?.length)
      return this.editableItems.reduce((acc, item) => acc + this.getCostIncludingVat(item), 0);
    return 0;
  }
  emitItems(hasInputChanged: boolean = false) {
    if (hasInputChanged) {
      this.dirty = true;
    }
    this.editableItems.forEach(element => {
      element.debtAmount = this.getCostIncludingVat(element);
      element.creditAmount = element.debtAmount;
    });
    const beforeAction = this.invoiceState?.selectedAction ? this.invoiceState.beforeChange?.invoiceActions?.find(f => f.invoiceActionId == this.invoiceState.selectedAction.invoiceActionId && f.orderId === this.invoiceState.selectedAction.orderId) : null;
    if (beforeAction && this.invoiceState?.selectedAction.invoiceActionId > 0) {
      this.invoiceState.actionSum = this.editableItems.reduce((acc, item) => acc + item.debtAmount, 0) - beforeAction.items.reduce((acc, item) => acc + this.getCostIncludingVat(item, true), 0);
    }
    else {
      this.invoiceState.actionSum = this.editableItems.reduce((acc, item) => acc + item.debtAmount, 0);
    }
    this.itemsChange.emit(this.editableItems);
  }
}
