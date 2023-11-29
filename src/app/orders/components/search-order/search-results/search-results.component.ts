import { AfterViewInit, Component, EventEmitter, OnInit, Output, ViewChild } from '@angular/core';
import { MatSort } from '@angular/material/sort';
import { OrdersDataSourceService } from 'src/app/orders/services/orders-data-source.service';
import { ActivatedRoute, Router } from '@angular/router';
import { MetadataService } from 'src/app/core/services/metadata.service';
import { OrdersService } from 'src/app/core/services/orders.service';
import { OrderSearchItem } from '@app/orders/services/order-search-item';
import { combineLatest, Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { UserService } from '@app/core/services/user.service';
import { User } from '@app/core/entities/user';
//import { SearchOrderComponent } from '../search-order.component';


@Component({
  selector: 'order-search-results',
  templateUrl: './search-results.component.html',
  styleUrls: ['./search-results.component.scss']
})
export class SearchResultsComponent implements OnInit, AfterViewInit {
  @ViewChild(MatSort) sort: MatSort;
  @Output()
  refreshRequired = new EventEmitter<void>();
  user: User
  displayedColumns = ['isCloseable', 'isEditable', 'isPrintable', 'orderId', 'branchName', 'budgetName', 'projectName', 'orderDescription', 'supplierName', 'requiredDate', 'orderBalance', 'orderTotal', 'orderStatusId', 'link'] as const;
  //router: any;

  constructor(
    public dataSource: OrdersDataSourceService,
    public metadataService: MetadataService,
    public orderService: OrdersService,
    private router: Router,
    private route: ActivatedRoute,
    private userService: UserService,) { }

  ngAfterViewInit(): void {
    this.dataSource.setSort(this.sort);
  }

  ngOnInit(): void {
    this.userId$.subscribe(u => {
      this.user = u;
    })
  }

  

  get userId$() {
    return this.metadataService.getUser();
  }

  get isReshetUser() {
    return this.userService.isNetworkAdmin(this.user);
  }

  print(orderId: number) {

    this.router.navigate([`/orders/print/${orderId}`]);

    /*    
    const url = this.router.serializeUrl(
        this.router.createUrlTree([`/orders/print/${orderId}`])
      );
    
      let params  = 'width='+(screen.width-screen.width/10);
      params += ', height='+(screen.height-screen.height/10);
      params += ', top=0, left=0'
      params += ', fullscreen=yes';
      
      const newwindow=window.open(url,'name',params);
        if (window.focus) {newwindow.focus()}
        return false;
  */
  }

  getInvoiceUrl(row: OrderSearchItem) {
    return combineLatest([this.route.queryParams]).pipe(
      map(([queryParams]) => {
        return { path: `/invoices/edit${queryParams.invoiceId ? ('/' + queryParams.invoiceId) : ''}`, qparams: { orderId: row.orderId } };
      })
    )
  }

  edit(orderId: number) {

    this.router.navigate(['orders', 'edit', orderId]);
  }


  closeOrder(orderId: number) {
    console.log('close');


    if (confirm('האם הינך מאשר\ת סגירת הזמנה זו?')) {

      let result = this.orderService.closeOrder(orderId)
      if (result) {
        alert(" הזמנה " + orderId + " נסגרה בהצלחה! ");
        this.refreshRequired.emit();
      }
      else {
        alert("סגירת ההזמנה נכשלה");
      }
    } else {
      alert("הפעולה בוטלה");
    }
  }
}
