import { Component, OnInit } from '@angular/core';
import { UntypedFormControl } from '@angular/forms';
import { throwToolbarMixedModesError } from '@angular/material/toolbar';
import { Observable } from 'rxjs';
import {
  distinctUntilChanged,
  filter,
  map,
  withLatestFrom,
} from 'rxjs/operators';
import { Cooperative } from 'src/app/core/entities/Cooperative';
import { MetadataService } from 'src/app/core/services/metadata.service';
import { UiStateService } from 'src/app/core/services/ui-state.service';
import { whenDifferentFrom } from 'src/app/shared/tools/rxjs-operators/when-different-from';
import { MatPaginator } from '@angular/material/paginator';
import { UserService } from 'src/app/core/services/user.service';
import { User } from '@app/core/entities/user';

@Component({
  selector: 'app-main-layout',
  templateUrl: './main-layout.component.html',
  styleUrls: ['./main-layout.component.scss'],
})
export class MainLayoutComponent implements OnInit {
  isSidebarOpen$: Observable<boolean>;
  allCooperatives$: Observable<Cooperative[]>;
  currentCooperativeId$: Observable<number>;
  currentUser$: Observable<User>;
  cooperative = new UntypedFormControl(null);
  helloUser: string = '';

  constructor(
    private uiState: UiStateService,
    private metadataService: MetadataService,
    public userService: UserService
  ) {}

  ngOnInit(): void {
    localStorage.clear();
    this.isSidebarOpen$ = this.uiState.isSidebarOpen;
    this.allCooperatives$ = this.metadataService.getAllCooperatives();
    this.currentUser$ = this.metadataService.getUser();
    this.currentCooperativeId$ = this.metadataService
      .getCooperativeId()
      .pipe(distinctUntilChanged());

    this.cooperative.valueChanges
      .pipe(whenDifferentFrom(this.currentCooperativeId$))
      .subscribe(async (val) => {
        await this.metadataService.setCooperativeId(val);
      });

    this.metadataService.getCooperativeId().subscribe((val) => {
      if (val !== this.cooperative.value) this.cooperative.setValue(val);
    });

    this.metadataService.getUser().subscribe((currentUser) => {
      if (currentUser !== undefined) {
        this.userService.myUser = currentUser;
        if(currentUser.branchId===150){
            this.userService.isReshetUser=true
        }
        this.helloUser = `שלום, ${currentUser.firstName} ${currentUser.lastName} - ${currentUser.branchName}`;
      }
    });
  }

  toggleSidebar() {
    this.uiState.toggleSidebar();
  }

  closeSidebar() {
    this.uiState.closeSidebar();
  }
}
