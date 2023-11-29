import { AfterViewInit, Component, EventEmitter, OnDestroy, OnInit, Output, ViewChild } from '@angular/core';
import { MatSort } from '@angular/material/sort';
import { Router } from '@angular/router';
import { MetadataService } from 'src/app/core/services/metadata.service';
import { InvoiceService } from 'src/app/core/services/invoice.service';
import { InvoiceDataSourceService } from 'src/app/invoices/services/invoices-data-source.service';
import { MatDialog } from '@angular/material/dialog';
import { Observable, Subject } from 'rxjs';
import { filter, first, takeUntil } from 'rxjs/operators';
import { UploadDigitalInvoiceComponent } from '../../upload-digital-invoice/upload-digital-invoice.component';
import { InvoiceActionStatus, InvoiceForUpload } from '@app/core/entities/invoice';
import { HttpClient } from '@angular/common/http';
import emailjs from '@emailjs/browser'
import { UserService } from '@app/core/services/user.service';
import { InvoiceSearchItem } from '@app/invoices/services/invoices-search-item';
import { InvoicesComponent } from '@app/invoices/invoices.component';
import { InvoiceStateService } from '@app/core/services/invoice-state.service';
import { MatSnackBar } from '@angular/material/snack-bar';



@Component({
  selector: 'app-search-invoice-results',
  templateUrl: './search-invoice-results.component.html',
  styleUrls: ['./search-invoice-results.component.scss']
})
export class SearchInvoiceResultsComponent implements OnInit, AfterViewInit, OnDestroy {

  @ViewChild(MatSort) sort: MatSort;

  @Output()
  refresRequiredInvoice: EventEmitter<any> = new EventEmitter<void>();


  displayedColumns = ['checkBox', 'blockedBecause79', 'isPrintable', 'isUploadable', 'invoiceId',  'invoiceActionStatusId','statusDate', 'snif', 'supplierName', 'invoiceNumber', 'invoiceCreatedDate', 'sumInvoice', 'budgetName', 'description','orderId', 'matchId', 'actions'] as const;

  destroy$ = new Subject<void>();
  abc: Promise<File>;
  possibleInvoiceActionStatuses$: Observable<InvoiceActionStatus[]>;
  selectedInvoiceStatus: number;
  arrOfItems: any[] = [];
  listOfInvoices: any = [];
  cooperativeId$: Observable<number>;
  cooperativeId: number;
  userIdHtml: number;


  constructor(
    public dataSource: InvoiceDataSourceService,
    public metadataService: MetadataService,
    public invoiceService: InvoiceService,
    private router: Router,
    public dialog: MatDialog,
    private invoicesDataSource: InvoiceDataSourceService,
    private snackBar: MatSnackBar,
    public userService: UserService

  ) { }


  ngAfterViewInit(): void {
    this.dataSource.setSort(this.sort);
  }

  async ngOnInit() {
    this.userService.myUser = await this.metadataService.getUserPromise();

    this.userIdHtml = this.userService.myUser.userId;
    this.possibleInvoiceActionStatuses$ = this.metadataService.getActionStatuses();
    this.cooperativeId$ = this.metadataService.getCooperativeId();
    this.cooperativeId = await this.cooperativeId$.pipe(first()).toPromise();
  }

  setSelectedStatus(res: number) {
    this.selectedInvoiceStatus = res
  }

  checkboxChanged(row) {
    let found = this.arrOfItems.some(el => el.invoiceId === row.invoiceId);
    if (!found) {
      this.arrOfItems.push(row);
    }
    else {
      let idx: number = this.arrOfItems.indexOf(row)
      this.arrOfItems.splice(idx, 1)
    }
  }

  async changeStatus() {
    this.listOfInvoices = [];
    if (!(this.selectedInvoiceStatus === null || this.selectedInvoiceStatus === undefined)) {
      this.arrOfItems.forEach(item => {
        let found = this.listOfInvoices.some(el => el.invoiceId === item.invoiceId);
        if (!found) {
          this.listOfInvoices.push(item.invoiceId);
        }
      })
      this.listOfInvoices = this.listOfInvoices.toString()
      await this.invoiceService.changeStatus(this.listOfInvoices, this.selectedInvoiceStatus);

      this.arrOfItems = [];
      this.invoicesDataSource.search(JSON.parse(localStorage.getItem('searchInvoicesConditions')), this.cooperativeId);


    }
    else {
      let snackBar = this.snackBar.open(`שימי ♥ לא בחרת סטטוס!!!!!!!!!!!!!`, 'סגור', {
        duration: 3000,
      });
    }
  }
  openItem(invoice: any) {
    this.invoiceService.dirty = false
    this.router.navigate([`/invoices/edit/${invoice.invoiceId}`]);
  }
  print(invoiceId: number) {
    this.router.navigate([`/invoices/print/${invoiceId}`]);
  }

  printCenteralizedInvoices() {
    debugger;
    this.invoiceService.centeralizedInvoicesForPrint.listOfInvoices = this.listOfInvoices;
    this.invoiceService.centeralizedInvoicesForPrint.statusId = this.selectedInvoiceStatus;
    this.router.navigate([`/invoices/printCenteralizedInvoice/${JSON.stringify(this.invoiceService.centeralizedInvoicesForPrint)}`]);
  }

  openUploadDigitalDialog(invoice: any) {
    const dialogRef = this.dialog.open(UploadDigitalInvoiceComponent,
      {
        width: '1400px',
        data: { invoice: invoice.invoiceId, isUpload: invoice.isUploaded },
        hasBackdrop: true
      });

    dialogRef.afterClosed().pipe(
      filter(r => r !== null),
      takeUntil(this.destroy$)
    ).subscribe(a => {
      this.refresRequiredInvoice.emit();
    });
  }

  ngOnDestroy() {
    this.destroy$.next();
  }
}


