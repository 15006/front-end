import { AfterViewInit, Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import test from 'node:test';
import { combineLatest, Observable } from 'rxjs';
import { distinctUntilChanged, filter, first, map, switchMap, tap, withLatestFrom } from 'rxjs/operators';
import { Cooperative } from 'src/app/core/entities/Cooperative';
import { InvoiceCenteralizedForPrint, InvoiceForPrint } from 'src/app/core/entities/invoice';
import { DatesService } from 'src/app/core/services/dates.service';
import { InvoiceService } from 'src/app/core/services/invoice.service';
import { MetadataService } from 'src/app/core/services/metadata.service';

@Component({
  selector: 'app-print-centeralized-invoice',
  templateUrl: './print-centeralized-invoice.component.html',
  styleUrls: ['./print-centeralized-invoice.component.scss']
})
export class PrintCenteralizedInvoiceComponent implements OnInit {

  cooperativeId$: Observable<number>;
  listOfInvoices$: Observable<InvoiceCenteralizedForPrint[]>;
  strCurrentDate: string;
  cooperative$: Observable<Cooperative>;
  selectedInvoiceStatus: number;
  invoicesList: any;
  sum: number;
  listOfInvoicesArr: any;

  constructor(
    private metadataService: MetadataService,
    private invoiceService: InvoiceService,
    private route: ActivatedRoute,
    private dateService: DatesService,

  ) { }

  ngOnInit() {
    this.initPage();
  }

  private async initPage() {
    this.cooperativeId$ = this.metadataService.getCooperativeId();
    let cooperativeId = await this.cooperativeId$.pipe(first()).toPromise();
    this.strCurrentDate = this.dateService.dateFormatedForPrint(new Date());
    debugger;

    console.log(this.route.snapshot.paramMap);
    let centeralObj = this.route.snapshot.paramMap.get('listOfInvoices');
    this.invoiceService.centeralizedInvoicesForPrint.listOfInvoices = JSON.parse(centeralObj).listOfInvoices;
    this.invoiceService.centeralizedInvoicesForPrint.statusId = JSON.parse(centeralObj).statusId;


    this.listOfInvoices$ = this.route.params.pipe(
      switchMap((param) => this.invoiceService.GetCenteralizedInvoiceForPrint(
        this.invoiceService.centeralizedInvoicesForPrint.listOfInvoices, cooperativeId)),
      //  map(param => this.sum = param),
      //  tap(_ => alert('1-' + JSON.stringify(this.sum)))
    );



    this.listOfInvoicesArr = await this.listOfInvoices$.pipe(first()).toPromise();
    // this.listOfInvoicesArr.map(a => Numbera.sumInvoiceAction).sum(function (a, b) {
    //   return a + b;
    // });
    this.sum = 0;
    this.listOfInvoicesArr.forEach(element => {
      this.sum += Number(element.sumInvoiceAction)
    });

    // console.log(this.listOfInvoices$ );
    this.listOfInvoices$.subscribe(async (val) => {
      await this.delay(500);
      window.print();
    });

  }

  public dateFormatedForPrint(myDate: Date): string {
    return this.dateService.dateFormatedForPrint(myDate);
  }

  public numberForPrint(myNum: any): string {
    console.log(myNum);
    return myNum.toString();
  }


  delay(millis): Promise<void> {
    return new Promise<void>(resolve => setTimeout(resolve, millis));
  }

  // async ngAfterViewInit() {

  // }
}
