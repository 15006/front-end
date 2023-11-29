import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { User } from '@app/core/entities/user';
import { MetadataService } from '@app/core/services/metadata.service';
import { UserService } from '@app/core/services/user.service';
import { combineLatest } from 'rxjs';
import { map } from 'rxjs/operators';

@Component({
  selector: 'app-main-navigation-menu',
  templateUrl: './main-navigation-menu.component.html',
  styleUrls: ['./main-navigation-menu.component.scss']
})
export class MainNavigationMenuComponent implements OnInit {

  user: User;
  constructor(
    private userService: UserService,
    private metadataService: MetadataService,
    private router: Router
  ) { }

 
  get isReshetUser$() {
    return combineLatest([this.metadataService.getUser()]).pipe(
      map(([user]) => this.userService.isNetworkAdmin(user))
    )
  }

  goToNewInvoice() {
    this.router.navigateByUrl('/', { skipLocationChange: true }).then(() => {
      this.router.navigateByUrl(this.newInvoiceUrl);
  }); 
}


  newInvoiceUrl = `/invoices/edit`;

  async ngOnInit() {

  }

}
