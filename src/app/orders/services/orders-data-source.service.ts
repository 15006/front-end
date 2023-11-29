import { CollectionViewer, DataSource } from '@angular/cdk/collections';
import { Injectable } from '@angular/core';
import { MatSort, Sort, SortDirection } from '@angular/material/sort';
import { BehaviorSubject, combineLatest, Observable } from 'rxjs';
import { filter, map, startWith, switchMap, tap } from 'rxjs/operators';
import { Order, OrderSearchForm } from 'src/app/core/entities/order';
import { User } from 'src/app/core/entities/user';
import { MetadataService } from 'src/app/core/services/metadata.service';
import { OrdersService } from 'src/app/core/services/orders.service';
import { OrderSearchItem } from './order-search-item';

@Injectable()
export class OrdersDataSourceService implements DataSource<OrderSearchItem> {
  private searches$ = new BehaviorSubject<[OrderSearchForm, number]>(null);
  private matSort$ = new BehaviorSubject<MatSort>(null);
  totalSum: number = 0
  index: number = 0;
  private user$!: Observable<User>;


  constructor(
    private ordersService: OrdersService,
    private metaService: MetadataService) {
    this.user$ = this.metaService.getUser();
  }

  private compare(a: OrderSearchItem, b: OrderSearchItem, sort: Sort) {
    let key1 = a[sort.active];
    let key2 = b[sort.active];

    let res = (key1 > key2) ? 1 : -1;
    return sort.direction === 'asc' ? res : -res;
  }

  private orderToOrderSearchItem(order: Order, user: User): OrderSearchItem {
    this.ordersService.isLoading=false

    return {
      ...order,
      isPrintable: (user.isReshetUser === 1) ||
        ((order.orderStatusId >= 100) && (order.orderStatusId <= 130)),
      isEditable: ((user.isReshetUser === 1) && (order.orderStatusId <= 140)) ||
        ((user.isReshetUser === 0) && (order.orderStatusId <= 100)),
      isCloseable: ((user.isReshetUser === 1) && (order.orderStatusId < 130)) ||
        ((user.isReshetUser === 0) && (order.orderStatusId <= 100))
    }
  }


  private createSortedItemsArray(orders: Order[], sort: Sort, user: User): OrderSearchItem[] {
    let items = orders.map(order => this.orderToOrderSearchItem(order, user));

    this.ordersService.isLoading = false;
    
    if (!sort) return items;
    return items.sort((a, b) => this.compare(a, b, sort));
  }

  getResults(): Observable<readonly OrderSearchItem[]> {

    let orders$ = this.searches$.pipe(
      filter(val => val !== null),
    //  tap(val => console.log('search for: ', val)),
      switchMap(([form, coopId]) => this.ordersService.searchOrders(form, coopId)), 
      startWith([]), 
      // tap(val => console.log('search results: ', val))
    );

    let sort$ = this.matSort$.pipe(
     // tap(val => console.log('mat sort: ', val)),
      filter(val => val !== null),
      switchMap(matSort => matSort
        .sortChange.pipe(
          startWith({active: matSort.active, direction: matSort.direction})
        )),
    //  tap(val => console.log('sort: ', val)),
    );

    return combineLatest(([orders$, sort$, this.user$])).pipe(
      map(([orders, sort, user]) => this
        .createSortedItemsArray(orders, sort, user))
    );
  }
  search(orderSearch: OrderSearchForm, cooperativeId: number) {
    this.searches$.next([orderSearch, cooperativeId]);
  
  }

  setSort(matSort: MatSort) {
    this.matSort$.next(matSort);

  }

  connect(collectionViewer: CollectionViewer): Observable<readonly OrderSearchItem[]> {
    return this.getResults();
  }

  disconnect(collectionViewer: CollectionViewer): void {
    this.searches$.complete();
    this.matSort$.complete();
  }
}
