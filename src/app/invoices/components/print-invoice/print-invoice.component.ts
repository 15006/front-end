import { AfterViewInit, Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { combineLatest, Observable } from 'rxjs';
import { distinctUntilChanged, filter, first, map, switchMap, tap, withLatestFrom } from 'rxjs/operators';
import { Cooperative } from 'src/app/core/entities/Cooperative';
import { InvoiceForPrint } from 'src/app/core/entities/invoice';
import { DatesService } from 'src/app/core/services/dates.service';
import { InvoiceService } from 'src/app/core/services/invoice.service';
import { MetadataService } from 'src/app/core/services/metadata.service';


@Component({
  selector: 'app-print-invoice',
  templateUrl: './print-invoice.component.html',
  styleUrls: ['./print-invoice.component.scss']
})
export class PrintInvoiceComponent implements OnInit, AfterViewInit {

  cooperativeId$: Observable<number>;
  invoice$: Observable<InvoiceForPrint>;
  strCurrentDate: string;
  cooperative$: Observable<Cooperative>;

  constructor(
    private metadataService: MetadataService,
    private invoiceService: InvoiceService,
    private route: ActivatedRoute,
    private router: Router,
    private dateService: DatesService
  ) { }

  ngOnInit() {
    this.initPage();
  }

  private async initPage() {


    this.cooperativeId$ = this.metadataService.getCooperativeId();


    this.cooperative$ = this.metadataService.getCooperative();
    console.log('coop Id ');
    console.log(await this.cooperativeId$.pipe(first()).toPromise());
    this.strCurrentDate = this.dateService.dateFormatedForPrint(new Date());

    //let isMainBranchUser = this.user.isAllowAllBranches;

    this.invoice$ = this.route.params.pipe(
      map(prms => Number(prms['invoiceId'])),
      //tap(invoiceId => console.log('invoice id = ' + invoiceId)),
      withLatestFrom(this.cooperativeId$),
      //tap(([invoiceId,cooperativeId]) => console.log('cooperativeId id = ' + cooperativeId)),
      switchMap(([invoiceId, cooperativeId]) => this.invoiceService.GetInvoiceForPrint(invoiceId, cooperativeId)),
      //tap(val => {console.log('print invoice');
      //console.log(val);})
    );
    // const invoieId$ = this.route.params.pipe(
    //   map(params => Number(params['invoiceId'])));

    //   this.invoice$ = combineLatest([invoieId$,this.cooperativeId$]).pipe(
    //     distinctUntilChanged(),
    //     switchMap(([invoiceId,cooperativeId]) => this.invoiceService.GetInvoiceForPrint(invoiceId, cooperativeId)),

    //   );
    this.invoice$.subscribe(async (val) => {
      await this.delay(500);
      window.print();
    });

  }


  public isConfirmed(invoiceStatusId: number): boolean {
    if (invoiceStatusId >= 80) {
      return true;
    }
    else {
      return false;
    }
  }

  public dateFormatedForPrint(myDate: Date): string {
    return this.dateService.dateFormatedForPrint(myDate);
  }

  public numberForPrint(myNum: any): string {
    console.log(myNum);
    return myNum.toString();
  }

  public strInvoiceType(isTaxInvoice: number): string {
    let str = '';
    if (isTaxInvoice === 1) {
      str = 'חשבונית מס';
    } else if (isTaxInvoice === 0) {
      str = 'חשבונית עסקה / דרישת תשלום / חשבון (למי שאינו עוסק מורשה)';
    }
    return str;
  }


  delay(millis): Promise<void> {
    return new Promise<void>(resolve => setTimeout(resolve, millis));
  }

  async ngAfterViewInit() {
    // await this.invoice$.pipe(first()).toPromise();
    // await this.delay(600);
    // window.print();
    // console.log('f')
  }
}
