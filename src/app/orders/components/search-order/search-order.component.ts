import { Component, OnInit, ViewChild, AfterViewInit, OnDestroy, ChangeDetectorRef } from '@angular/core';
// import { UntypedFormControl, UntypedFormGroup } from '@angular/forms';
import { Router } from '@angular/router';
import { Observable, BehaviorSubject, combineLatest, Subscription, merge, Subject } from 'rxjs';
import { distinctUntilChanged, filter, first, map, startWith, switchMap, takeUntil, withLatestFrom } from 'rxjs/operators';
import { Branch } from 'src/app/core/entities/branch';
import { Budget } from 'src/app/core/entities/budget';
import { Cooperative } from 'src/app/core/entities/Cooperative';
import { OrderSearchForm } from 'src/app/core/entities/order';
import { OrderStatus } from 'src/app/core/entities/order-status';
import { Project } from 'src/app/core/entities/project';
import { SchoolYear } from 'src/app/core/entities/school-year';
import { Supplier } from 'src/app/core/entities/supplier';
import { User } from 'src/app/core/entities/user';
import { MetadataService } from 'src/app/core/services/metadata.service';
import { OrdersService } from 'src/app/core/services/orders.service';
import { filterSuppliers } from './search-helper';
import { OrdersDataSourceService } from '../../services/orders-data-source.service';
import { UntypedFormGroup, UntypedFormControl } from '@angular/forms';
import { UserService } from '@app/core/services/user.service';

@Component({
  selector: 'app-search-order',
  templateUrl: './search-order.component.html',
  styleUrls: ['./search-order.component.scss'],
  providers: [OrdersDataSourceService]
})

export class SearchOrderComponent implements OnInit, OnDestroy {
  form: UntypedFormGroup;
  destroy$ = new Subject<void>();

  possibleSchoolYear$: Observable<SchoolYear[]>;
  possibleAllOrderStatuses$: Observable<OrderStatus[]>;
  possibleBranches$: Observable<Branch[]>;
  possibleBudgets$: Observable<Budget[]>;
  possibleProjects$: Observable<Project[]>;
  possibleSuppliers$: Observable<Supplier[]>;
  filteredPossibleSuppliers$: Observable<Supplier[]>;
  supplierDisplayFunc = (all: Supplier[]) => (id: string) => {
    if (all && id) return all.find(s => s.supplierId === id)?.supplierName;
    return '';
  };


  selectedSchoolYearId$: Observable<number>;
  selectedBranchId$: Observable<number>;
  selectedBudgetId$: Observable<number>;
  selectedProjectId$: Observable<number>;
  selectedSupplierId$: Observable<string>;
  selectedSchoolYear$: Observable<SchoolYear>;
  fromDate: Date;
  toDate$: Observable<Date>;

  user$: Observable<User>;
  cooperative$: Observable<Cooperative>;
  cooperativeId$: Observable<number>;

  userWorkInTheMainBranch$: Observable<boolean>;

  private busyCounter = new BehaviorSubject<number>(0);
  isBusy$ = this.busyCounter.pipe(
    map(val => val > 0)
  );

  constructor(
    private metaDataService: MetadataService,
    private ordersService: OrdersService,
    private router: Router,
    private orderDataSource: OrdersDataSourceService,
    public orderService: OrdersService,
    private cdRef: ChangeDetectorRef,
    public userService:UserService
  ) { }

  ngOnInit() {
    this.cooperativeId$ = this.metaDataService.getCooperativeId();
    this.userWorkInTheMainBranch$ = this.metaDataService.getUser().pipe(
      map(u => u.isReshetUser === 1)
    );

    this.initForm();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
  }

  private async initForm() {
    this.form = new UntypedFormGroup({
      orderId: new UntypedFormControl(null),
      schoolYearId: new UntypedFormControl(null),
      fromDate: new UntypedFormControl(this.fromDate),
      toDate: new UntypedFormControl(),
      branchId: new UntypedFormControl(),
      budgetId: new UntypedFormControl(null),
      projectId: new UntypedFormControl(null),
      supplierId: new UntypedFormControl(null),
      fromOrderStatusId: new UntypedFormControl(null),
      toOrderStatusId: new UntypedFormControl(null),
      fromOrderSum: new UntypedFormControl(),
      toOrderSum: new UntypedFormControl()
    });

    this.setBusy(true);
    this.user$ = this.metaDataService.getUser();
    this.setBusy(false);

    this.cooperative$ = this.metaDataService.getCooperative();

    this.possibleAllOrderStatuses$ = this.metaDataService.getAllOrderStatuses();

    this.possibleSchoolYear$ = this.metaDataService.getAllSchoolYears();

    this.selectedBranchId$ = this.control('branchId').valueChanges.pipe(
      startWith(this.control('branchId').value),
      map(str => (str === null) ? null : Number(str))
    );

    this.selectedBudgetId$ = this.control('budgetId').valueChanges.pipe(
      startWith(this.control('budgetId').value),
      map(str => (str === null) ? null : Number(str))
    );

    this.selectedProjectId$ = this.control('projectId').valueChanges.pipe(
      startWith(this.control('projectId').value),
      map(str => (str === null) ? null : Number(str))
    );

    this.selectedSupplierId$ = this.control('supplierId').valueChanges.pipe(
      startWith(this.control('supplierId').value)
    );

    this.selectedSchoolYearId$ = this.control('schoolYearId').valueChanges.pipe(
      startWith(this.control('schoolYearId').value),
      map(str => (str === null) ? null : Number(str))
    );

    this.selectedSchoolYear$ = this.selectedSchoolYearId$.pipe(
      distinctUntilChanged(),
      withLatestFrom(this.possibleSchoolYear$),
      map(pair => { return { selectedSchoolYearId: pair[0], schoolYearList: pair[1] } }),
      filter(pair => pair.selectedSchoolYearId !== null),
      filter(pair => pair.schoolYearList !== null),
      switchMap(pair => pair.schoolYearList.filter(s => s.schoolYearId === pair.selectedSchoolYearId)),
    );

    this.possibleBranches$ = this.metaDataService.getAllBranches();

    this.possibleBudgets$ = this.selectedBranchId$.pipe(
      distinctUntilChanged(),
      switchMap(id => this.metaDataService.getAllBudgetsForBranch(id))
    );

    this.possibleProjects$ = combineLatest([this.selectedBudgetId$, this.selectedSchoolYearId$]).pipe(
      distinctUntilChanged(),
      switchMap(([budgetId, schoolYearId]) => this.metaDataService.getAllProjectsForBudgetAndSchoolYear(budgetId, schoolYearId))
    );

    this.possibleSuppliers$ = this.metaDataService.getAllSuppliers();
    let supplierSearch$ = this.control('supplierId').valueChanges.pipe(
      startWith('')
    );

    this.filteredPossibleSuppliers$ =
      combineLatest([this.possibleSuppliers$, supplierSearch$]).pipe(
        map(([options, keyword]) => filterSuppliers(options, keyword))
      );

    this.selectedSchoolYear$.pipe(
      filter(s => s !== null),
      takeUntil(this.destroy$)
    ).subscribe(val => {
      this.control('fromDate').setValue(val.startYear),
        this.control('toDate').setValue(val.endYear)
    });

    this.verifyOptionsListContainsSelected(
      this.possibleSchoolYear$, this.selectedSchoolYearId$,
      b => b.schoolYearId, 'schoolYearId'
    );

    this.verifyOptionsListContainsSelected(
      this.possibleBranches$, this.selectedBranchId$,
      b => b.branchId, 'branchId'
    );

    this.verifyOptionsListContainsSelected(
      this.possibleBudgets$, this.selectedBudgetId$,
      b => b.budgetId, 'budgetId'
    );

    this.verifyOptionsListContainsSelected(
      this.possibleProjects$, this.selectedProjectId$,
      p => p.projectId, 'projectId'
    );

    this.verifyOptionsListContainsSelected(
      this.possibleSuppliers$, this.selectedSupplierId$,
      s => s.supplierId, 'supplierId'
    );

    let branchIdControl = this.control('branchId');

    this.selectedBranchId$ = branchIdControl.valueChanges.pipe(
      startWith(branchIdControl.value),
      map(str => (str === null) ? null : Number(str))
    );

    this.possibleBranches$ = this.metaDataService.getAllBranches();

    this.possibleBranches$.subscribe(val => {
      //  console.log('possible branches', val);
    })


    // when possible branches does not include the selected branch id
    combineLatest([this.possibleBranches$, this.selectedBranchId$]).pipe(
      filter(([_, branchId]) => branchId !== null),
      filter(([branches, branchId]) => !branches || !branches.some(b => b.branchId === branchId)),
      takeUntil(this.destroy$)
    ).subscribe(_ => {
      branchIdControl.setValue(null);
    });

    if (!localStorage.searchOrdersConditions) {
      this.getDefaultOrderSearchFunc();
    }
    else {
      this.form.setValue(JSON.parse(localStorage.getItem('searchOrdersConditions')));
      this.searchOrders()
    }
  }

  control(name: keyof OrderSearchForm): UntypedFormControl {
    return this.form.get(name) as UntypedFormControl;
  }

  ngAfterViewChecked() {
    this.cdRef.detectChanges();
  }
  public async searchOrders() {
    console.log('searching');
    let cooperativeId = await this.cooperativeId$.pipe(first()).toPromise();
    let orderSearch = this.form.getRawValue();
    this.orderService.isLoading = true;

    if (localStorage.searchOrdersConditions)
      localStorage.searchOrdersConditions = JSON.stringify(orderSearch)
    else {
      localStorage.setItem('searchOrdersConditions', JSON.stringify(orderSearch));
    }
    this.orderDataSource.search(orderSearch, cooperativeId);
  }

  updateOrder(orderId: number) {
    this.router.navigate(['order', orderId]);
  }

  valid_numbers(e: any) {
    return this.metaDataService.valid_numbers(e);
  }

  // isPrintable(orderStatusId: number): boolean {
  //   if (orderStatusId >= 100 && orderStatusId <= 110) {
  //     return true;
  //   }
  //   else {
  //     return false;
  //   }
  // }



  public async getDefaultOrderSearchFunc() {
    let defaultValue = await this.ordersService.getDefaultOrderSearch()
      .pipe(first())
      .toPromise();
    this.form.setValue(defaultValue);
  }

  private verifyOptionsListContainsSelected<T, K>(
    onOptions: Observable<T[]>,
    onSelected: Observable<K>,
    keySelector: (t: T) => K,
    fieldName: keyof OrderSearchForm
  ): void {
    let onWrong = onOptions.pipe(
      withLatestFrom(onSelected),
      filter(pair => pair[1] !== null),
      filter(pair => !pair[0] || !pair[0].some(t => keySelector(t) === pair[1])),
      map(() => { })
    );

    onWrong
      .pipe(takeUntil(this.destroy$))
      .subscribe(_ => {
        this.control(fieldName).setValue(null);
      });
  }

  setBusy(value: boolean) {


    if (value) {
      this.busyCounter.next(this.busyCounter.value + 1);
    } else {
      this.busyCounter.next(this.busyCounter.value - 1);
    }
  }
}
