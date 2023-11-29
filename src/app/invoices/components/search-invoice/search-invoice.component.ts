import { Component, OnInit, ViewChild, AfterViewInit, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { UntypedFormControl, UntypedFormGroup, Validators } from '@angular/forms';
import { Branch } from '@app/core/entities/branch';
import { OrdersService } from '@app/core/services/orders.service';
import { UserService } from '@app/core/services/user.service';
// import { UntypedFormControl, UntypedFormGroup } from '@angular/forms';
import { Observable, Subject, combineLatest } from 'rxjs';
import { filter, first, map, startWith, takeUntil, tap } from 'rxjs/operators';
import { InvoiceActionStatus, InvoiceSearchForm } from 'src/app/core/entities/invoice';
import { InvoiceService } from 'src/app/core/services/invoice.service';
import { MetadataService } from 'src/app/core/services/metadata.service';
import { InvoiceDataSourceService } from 'src/app/invoices/services/invoices-data-source.service';


@Component({
  selector: 'app-search-invoice',
  templateUrl: './search-invoice.component.html',
  styleUrls: ['./search-invoice.component.scss'],
  providers: [InvoiceDataSourceService]
})

export class SearchInvoiceComponent implements OnInit, OnDestroy {

  form: UntypedFormGroup;
  cooperativeId$: Observable<number>;
  possibleInvoiceActionStatuses$: Observable<InvoiceActionStatus[]>;
  possibleBranches$: Observable<Branch[]>;
  selectedBranchId$: Observable<number>;
  destroy$ = new Subject<void>();
  form79: UntypedFormGroup;

  constructor(
    private metadataService: MetadataService,
    public invoiceService: InvoiceService,
    private invoicesDataSource: InvoiceDataSourceService,
    private cdRef: ChangeDetectorRef,
    public userService: UserService,
    public orderService: OrdersService

  ) { }

  async ngOnInit() {
    this.cooperativeId$ = this.metadataService.getCooperativeId();
    let cooperativeId = await this.cooperativeId$.pipe(first()).toPromise();
    this.possibleInvoiceActionStatuses$ = this.metadataService.getActionStatuses();
    this.possibleBranches$ = this.metadataService.getAllBranches();
    const result = this.metadataService.getUserPromise();
    this.userService.myUser = await result;

    if (this.orderService.SearchInvoicesForStatus79 || this.orderService.Blocking79Flag) {
      this.form79 = new UntypedFormGroup({
        invoiceId: new UntypedFormControl(null),
        invoiceNumber: new UntypedFormControl(null),
        packageId: new UntypedFormControl(null),
        orderId: new UntypedFormControl(null),
        supplier: new UntypedFormControl(null),
        fromInvoiceStatus: new UntypedFormControl(79),
        toInvoiceStatus: new UntypedFormControl(79),
        snif: new UntypedFormControl(this.userService.myUser.userId === 15020 ? null : this.userService.myUser.branchId ),
      }) //as InvoiceSearchForm
      // alert(JSON.stringify(searchInvoice))
      // this.invoicesDataSource.search(searchInvoice, cooperativeId);
      this.searchInvoices()
    }
    this.initForm();

  }
  public async getDefaultInvoiceSearchFunc() {
    let defaultValue = await this.invoiceService.getDefaultInvoiceSearch().pipe(first())
      .toPromise();

    this.form.setValue(defaultValue);
  }
  ngAfterViewChecked() {
    this.cdRef.detectChanges();
  }
  ngOnDestroy() {

  }

  reset() {
    this.form = new UntypedFormGroup({
      invoiceId: new UntypedFormControl(null),
      invoiceNumber: new UntypedFormControl(null),
      packageId: new UntypedFormControl(null),
      orderId: new UntypedFormControl(null),
      supplier: new UntypedFormControl(null),
      fromInvoiceStatus: new UntypedFormControl(74),
      toInvoiceStatus: new UntypedFormControl(85),
      snif: new UntypedFormControl( this.userService.myUser.userId === 15020 ? null : this.userService.myUser.branchId ),
    })

    // this.form.setValue(this.form.value)
  }

  private async initForm() {
    this.form = new UntypedFormGroup({
      invoiceId: new UntypedFormControl(null), 
      invoiceNumber: new UntypedFormControl(null),
      packageId: new UntypedFormControl(null),
      orderId: new UntypedFormControl(null),
      supplier: new UntypedFormControl(null),
      fromInvoiceStatus: new UntypedFormControl(74),
      toInvoiceStatus: new UntypedFormControl(85),
      snif: new UntypedFormControl( this.userService.myUser.userId === 15020 ? null : this.userService.myUser.branchId ),
    })
    if (!localStorage.searchInvoicesConditions) {
      // this.getDefaultInvoiceSearchFunc(); 
    }
    else {
      this.form.setValue(JSON.parse(localStorage.getItem('searchInvoicesConditions')));
      this.searchInvoices()
    }
  }

  control(name: keyof InvoiceSearchForm): UntypedFormControl {
    return this.form.get(name) as UntypedFormControl;
  }

  public async searchInvoices() {
    let searchInvoice;
    console.log("searchInvoices==========");
    if (!this.orderService.Blocking79Flag) {
      searchInvoice = this.form.getRawValue();
    }
    else {
      searchInvoice = this.form79.getRawValue()
    }
    let cooperativeId = await this.cooperativeId$.pipe(first()).toPromise();
    this.invoiceService.isLoading = true;
    if (localStorage.searchInvoicesConditions)
      localStorage.searchInvoicesConditions = JSON.stringify(searchInvoice)
    else {
      localStorage.setItem('searchInvoicesConditions', JSON.stringify(searchInvoice));
    }
    this.invoicesDataSource.search(searchInvoice, cooperativeId);
  }
  valid_numbers(e: any) {
    return this.metadataService.valid_numbers(e);
  }
  // public async getDefaultInvoiceSearchFunc() {
  //   this.form.reset();
  // }
}