import { AfterViewInit, Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { combineLatest, Observable } from 'rxjs';
import { distinctUntilChanged, first, map, switchMap, tap, withLatestFrom } from 'rxjs/operators';
import { OrderToPrint } from 'src/app/core/entities/order';
import { DatesService } from 'src/app/core/services/dates.service';
import { MetadataService } from 'src/app/core/services/metadata.service';
import { OrdersService } from 'src/app/core/services/orders.service';

@Component({
  selector: 'app-print-order',
  templateUrl: './print-order.component.html',
  styleUrls: ['./print-order.component.scss']
})
export class PrintOrderComponent implements OnInit, AfterViewInit {

  order$: Observable<OrderToPrint>;
  cooperativeId$: Observable<number>;
  userWorkInTheMainBranch$: Promise<boolean>;
  totalOrderDetails$: Observable<number>;
  strCurrentDate: string;
  date: Date = new Date();
  phoneNumber: any
  finalNumbers:any
  branchNumber: any;
  supplierNumber: string;
   constructor(private metadataService: MetadataService,
    private orderService: OrdersService,
    private route: ActivatedRoute,
    private router: Router,
    private dateService: DatesService
  ) { }

  ngOnInit() {
    this.userWorkInTheMainBranch$ = this.metadataService
      .getUser().toPromise()
      .then(u => u.isReshetUser === 1);
    this.initPage()
  }

  private async initPage() {

    this.cooperativeId$ = this.metadataService.getCooperativeId();

    this.strCurrentDate = this.dateService.dateFormatedForPrint(new Date());

    const orderId$ = this.route.params.pipe(
      map(prms => Number(prms['orderId'])),
    );

    this.order$ = combineLatest([orderId$, this.cooperativeId$]).pipe(
      distinctUntilChanged(),
      switchMap(([orderId, cooperativeId]) => this.orderService.getOrderToPrint(orderId, cooperativeId)),
      tap(val => console.log(val)),
      map(val => this.phoneNumber = val)
    );

    this.totalOrderDetails$ = this.order$.pipe(
      map(orderVal => {
        let total = 0;
        orderVal.orderDetails.forEach(orderDetailVal => total += orderDetailVal.unitPrice * orderDetailVal.quantity);
        return total
      }));


  }

  delay(millis): Promise<void> {
    return new Promise<void>(resolve => setTimeout(resolve, millis));
  }

  async ngAfterViewInit() {
    await this.order$.pipe(first()).toPromise();
    this.branchNumber=this.phoneNumber.branchPhoneNumber
    this.supplierNumber=this.phoneNumber.supplierPhone
    
    await this.delay(350);
    window.print();
  }

}
