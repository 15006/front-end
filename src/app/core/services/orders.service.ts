import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { combineLatest, Observable } from 'rxjs';
import {
  distinctUntilChanged,
  first,
  map,
  switchMap,
  tap,
} from 'rxjs/operators';
import { cache } from 'src/app/shared/tools/rxjs-operators/cache';
import {
  Order,
  OrderSearchForm,
  OrderToPrint,
  OrderVm,
} from '../entities/order';
import { UrlService } from './url.service';
import { UserService } from './user.service';
import { MetadataService } from './metadata.service';
import { OrderDetail } from '../entities/order-detail';

@Injectable({
  providedIn: 'root',
})
export class OrdersService {
  temp: any;

  private defaultOrder$: Observable<OrderVm>;
  private defaultOrderSearch$: Observable<OrderSearchForm>;
  private userId$: Observable<number>;
  private cooperativeId$: Observable<number>;
  isLoading: boolean = false;
  index: number = 0;
  totalSum: number = 0;
  itemTotalSum: number = 0;
  flag: boolean = false;
  Blocking79Flag: boolean = false;
  orderTable: OrderDetail[] = [];
  SearchInvoicesForStatus79:boolean=false;
  displayedColumns: string[] = [
    'actions',
    'description',
    'quantity',
    'unitPrice',
    'itemTotalSum',
  ];
  editFlag: boolean = false;
  constructor(
    private http: HttpClient,
    private urlService: UrlService,
    private userService: UserService,
    private metadataService: MetadataService
  ) {
    this.calcDefaults();
  }

  getOrderToPrint(
    orderId: number,
    cooperativeId: number
  ): Observable<OrderToPrint> {
    //throw new Error('Method not implemented.');
    let userId = this.userId$;
    let baseUrl = this.urlService.getUrl('order/getOrderToPrint');
    let url$ = this.userId$.pipe(
      map((userId) => `${baseUrl}/${orderId}/${userId}/${cooperativeId}`)
    );

    return url$.pipe(switchMap((url) => this.http.get<OrderToPrint>(url)));
  }

  private getFromHttp<T>(url: string): Observable<T> {
    let fixedUrl = this.urlService.getUrl(url);
    return this.http.get<T>(fixedUrl);
  }

  private calcDefaults() {
    this.userId$ = this.userService.getUserId();

    this.defaultOrder$ = this.userId$.pipe(
      // tap(userId => console.log('getDefaultOrder, userId = ', userId)),
      switchMap((userId) =>
        this.getFromHttp<OrderVm>(`order/getDefault/${userId}`)
      ),
      cache()
    );

    this.defaultOrderSearch$ = this.userId$.pipe(
      switchMap((userId) =>
        this.getFromHttp<OrderSearchForm>(
          `order/getDefaultOrderSearch/${userId}`
        )
      ),
      cache()
    );

    this.cooperativeId$ = this.metadataService.getCooperativeId();
  }

  public getDefaultOrder(): Observable<OrderVm> {
    console.log('OrdersService.getDefaultOrder');
    return this.defaultOrder$;
  }

  public getDefaultOrderSearch(): Observable<OrderSearchForm> {
    return this.defaultOrderSearch$;
  }
  async getQuater(d: string) {
    d = new Date(d).toLocaleDateString('en-GB', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    });

    let month = d.toString().substring(3, 5);

    let numMonth = Number(month);
    switch (numMonth) {
      case 9:
      case 10:
      case 11:
        return 1;
      case 12:
      case 1:
      case 2:
        return 2;
      case 3:
      case 4:
      case 5:
        return 3;
      case 6:
      case 7:
      case 8:
        return 4;
      default:
        return 3;
    }
  }

  public getOrderById(
    orderId: number,
    cooperativeId: number
  ): Observable<OrderVm> {
    let baseUrl = this.urlService.getUrl('order/get');
    let url$ = this.userId$.pipe(
      map((userId) => `${baseUrl}/${orderId}/${userId}/${cooperativeId}`)
    );

    return url$.pipe(switchMap((url) => this.http.get<OrderVm>(url)));
  }

  // public getOrderById(orderId: number) {
  //   let url = this.urlService.getUrl(`order/get/${orderId}`);
  //   return this.http.get<OrderVm>(url)
  // }

  public async saveOrder(orderToSave: OrderVm): Promise<OrderVm> {
    let url = this.urlService.getUrl('order/');

    return await this.http.post<OrderVm>(url, orderToSave).toPromise();
  }

  private convertNullToMinOne(param: any): number {
    if (param == null || param == '') {
      return -1;
    } else {
      return param;
    }
  }

  public getBudgetBalance(
    budgetId: string,
    snifId: string,
    yearId: number,
    currentDate: any,
    userId: number,
    cooperative: number
  ): Observable<any> {
    let user = this.userId$;
    let baseUrl = this.urlService.getUrl('order/getBudgetBalance');
    let url$ = this.userId$.pipe(
      map(
        (user) =>
          `${baseUrl}/${budgetId}/${snifId}/${yearId}/${currentDate}/${userId}/${cooperative}`
      )
    );

    return url$.pipe(switchMap((url) => this.http.get<object>(url)));
    //   return this.userId$.pipe(
    //     map(userId => `${baseUrl}/${budgetId}/${snifId}/${yearId}/${currentDate}/${userId}/${cooperative}`),
    //    switchMap(url => this.http.get<number[]>(url))
    //  );

    //  let url$ = this.userId$.pipe(
    //   map(userId => `${baseUrl}/${budgetId}/${snifId}/${yearId}/${currentDate}/${userId}/${cooperative}`));
    //   console.log('after url   '+url);

    // return url$.pipe(
    //   switchMap(url => this.http.get<>(url))
    // );
  }
  ifDisabled(row: any) {
   // alert(this.Blocking79Flag)
    if (typeof row === 'object' && !this.Blocking79Flag) {
      if (
        (row.orderBalance === 0 && !this.userService.isReshetUser) ||
        row.orderStatusId > 110 ||
        row.orderStatusId < 100
      ) {
        return true;
      }
      return false;
    } else {
      if (!this.Blocking79Flag)
        this.SearchInvoicesForStatus79= confirm('יש לך חשבונית בסטטוס 79 שחוסמת את המערכת.\nהאם ברצונך לצפות בה?');
      this.Blocking79Flag = true;
      return row;
    }
  }
  public searchOrders(
    orderSearch: OrderSearchForm,
    cooperativeId: number
  ): Observable<Order[]> {
    let baseUrl = this.urlService.getUrl('order/orderSearch');
    let orderId = this.convertNullToMinOne(orderSearch.orderId);
    let schoolYearId = this.convertNullToMinOne(orderSearch.schoolYearId);
    let branchId = this.convertNullToMinOne(orderSearch.branchId);
    let budgetId = this.convertNullToMinOne(orderSearch.budgetId);
    let projectId = this.convertNullToMinOne(orderSearch.projectId);
    let supplierId = this.convertNullToMinOne(orderSearch.supplierId);
    let fromOrderStatusId = this.convertNullToMinOne(
      orderSearch.fromOrderStatusId
    );
    let toOrderStatusId = this.convertNullToMinOne(orderSearch.toOrderStatusId);
    let fromOrderSum = this.convertNullToMinOne(orderSearch.fromOrderSum);
    let toOrderSum = this.convertNullToMinOne(orderSearch.toOrderSum);
    // let userId =  (await this.metadataService.getUser().pipe(first()).toPromise()).userId;
    //console.log({baseUrl},{orderId},{schoolYearId},{branchId},{budgetId},{projectId},{supplierId},{orderStatusId},{fromOrderSum},{toOrderSum},{userId1},{cooperativeId});

    //map(userId => `${baseUrl}/${orderId}/${schoolYearId}/${branchId}/${budgetId}/${projectId}/${supplierId}/${orderStatusId}/${orderSearch.fromOrderSum}/${orderSearch.toOrderSum}/${userId}/${cooperativeId}`),

    return this.userId$.pipe(
      map(
        (userId) =>
          `${baseUrl}/${orderId}/${schoolYearId}/${branchId}/${budgetId}/${projectId}/${supplierId}/${fromOrderStatusId}/${toOrderStatusId}/${fromOrderSum}/${toOrderSum}/${userId}/${cooperativeId}`
      ),
      switchMap((url) => this.http.get<Order[]>(url))
    );
  }

  public async closeOrder(orderId: number): Promise<boolean> {
    let cooperativeId$ = this.metadataService.getCooperativeId();

    let url = this.urlService.getUrl('order/closeOrder');

    let res = combineLatest([this.userId$, this.cooperativeId$]).pipe(
      distinctUntilChanged(),
      map(
        ([userId, cooperativeId]) =>
          `${url}/${orderId}/${userId}/${cooperativeId}`
      ),
      switchMap((url) => this.http.get<boolean>(url))
    );

    // let res1 = this.userId$.pipe(
    //   map(userId => `${url}/${orderId}/${userId}/${cooperativeId}`),
    //   switchMap(url => this.http.get<boolean>(url))
    // );

    return res.toPromise();
  }

  finishOrder() {
    this.totalSum = 0;
    // console.log(this.orderService.orderTable[this.orderService.orderTable.length - 1].unitPrice, "before");
    // this.orderService.orderTable.forEach(s.itemTotalSum=>this.orderService.totalSum+=sum)
    this.flag = true;
    for (let i = 0; i < this.orderTable.length; i++) {
      if (
        this.orderTable[i].quantity === 0 ||
        this.orderTable[i].unitPrice === 0
      ) {
        {
          return;
        }
      }
      this.totalSum +=
        this.orderTable[i].quantity * this.orderTable[i].unitPrice;
    }
    this.flag = true;
  }

  public getOrderTotalSum(orderId: number): Observable<number> {
    let url = this.urlService.getUrl('order');

    return combineLatest([this.userId$, this.cooperativeId$]).pipe(
      distinctUntilChanged(),
      map(
        ([userId, cooperativeId]) =>
          `${url}/${orderId}/total/${userId}/${cooperativeId}`
      ),
      switchMap((url) => this.http.get<number>(url))
    );
  }
}
