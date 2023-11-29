import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { User } from '@app/core/entities/user';
import { MetadataService } from '@app/core/services/metadata.service';
import { OrdersService } from '@app/core/services/orders.service';
import { UserService } from '@app/core/services/user.service';
import { Observable, first } from 'rxjs';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss'],
})
export class HomeComponent implements OnInit {
  user: User;
  cooperativeId$: Observable<number>;

  constructor(
    private userService: UserService,
    private orderService: OrdersService,
    private router: Router,
    private metadataService: MetadataService
  ) { }

  async ngOnInit(): Promise<void> {
    this.cooperativeId$ = this.metadataService.getCooperativeId();
    let cooperativeId = await this.cooperativeId$.pipe(first()).toPromise();
    this.user = await this.metadataService.getUserPromise();
    if (!this.userService.isNetworkAdmin(this.user)) {
      let isBlocked79: any = await this.userService.isBlockedBecauseStatus79(
        this.user.branchId,
        this.user.userId,
        cooperativeId
      );
      if (isBlocked79.length !== 0 && isBlocked79[0].isBlocked === false) {
        alert('שימו לב יש לכם חשבונית בסטטוס 79 , המערכת עומדת להחסם');
      } else {
        if (isBlocked79.length !== 0 && isBlocked79[0].isBlocked === true ) {
          this.orderService.ifDisabled(true);
          if (this.orderService.SearchInvoicesForStatus79) {
            this.router.navigate(['/invoices/search']);
          }
        }
      }
    }
  }
}