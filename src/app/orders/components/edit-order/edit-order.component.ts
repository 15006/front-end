import { Branch } from 'src/app/core/entities/branch';
import { Budget } from 'src/app/core/entities/budget';
import { Component, OnInit, OnDestroy, ChangeDetectorRef } from '@angular/core';
// import { Cooperative } from 'src/app/core/entities/Cooperative';
import { OrderVm, OrderForm } from 'src/app/core/entities/order';
import { Project } from 'src/app/core/entities/project';
import { SchoolYear } from 'src/app/core/entities/school-year';
import { OrderStatus } from 'src/app/core/entities/order-status';
import { OrdersService } from 'src/app/core/services/orders.service';
import { User } from 'src/app/core/entities/user';
import { DatesService } from 'src/app/core/services/dates.service';
import { SchoolYearService } from 'src/app/core/services/school-year.service';
import { DateValidators } from 'src/app/core/validators/date-validators';
import { ActivatedRoute, Router } from '@angular/router';
import { cache } from 'src/app/shared/tools/rxjs-operators/cache';
import { UntypedFormArray, UntypedFormControl, UntypedFormGroup, Validators } from '@angular/forms';
import { combineLatest, merge, Observable, Subject, Subscription } from 'rxjs';
import { MetadataService } from 'src/app/core/services/metadata.service';
import { distinctUntilChanged, filter, first, map, mapTo, skip, startWith, switchMap, tap, withLatestFrom } from 'rxjs/operators';
import { Moment } from 'moment';
import { OrderDetail } from '@app/core/entities/order-detail';
import { DatePipe } from '@angular/common';
import { Cooperative } from '@app/core/entities/Cooperative';


@Component({
  selector: 'app-edit-order',
  templateUrl: './edit-order.component.html',
  styleUrls: ['./edit-order.component.scss']
})

export class EditOrderComponent implements OnInit, OnDestroy {

  form: UntypedFormGroup;

  cooperativeId: Observable<Cooperative>;
  cooperativeId$: Observable<number>;

  minimumLegalRequireDate: string;
  schoolYearOfRequiredDate$: Observable<SchoolYear>;
  schoolYearOfRequiredDate: any;
  private orderId$: Observable<number>;
  isNew$: Observable<boolean>;
  order$: Observable<OrderVm>;
  isBusy$: Observable<boolean>;
  isAllowSetStatus$: Observable<boolean>;

  user$: Observable<User>;
  isPrintable$: Observable<boolean>;
  budgetBalance: any;
  orderStatus$: Observable<OrderStatus>
  possibleAllOrderStatuses: Observable<OrderStatus[]>;
  possibleBranches: Observable<Branch[]>;
  possibleBudgets: Observable<Budget[]>;
  possibleProjects: Observable<Project[]>;

  selectedBranchId: Observable<number>;
  selectedBudgetId: Observable<number>;
  selectedProjectId: Observable<number>;

  orderByOrderId: Promise<OrderVm>;
  enableSave: boolean = true;
  index: any;
  orderStatus: OrderStatus;

  private subs: Subscription[] = [];
  savedFormValue: OrderForm;
  input:any;
  saveAction = new Subject<void>();
  today: string;
  budgetBalanceByQuater: any;
  quater: number;
  user: any;
  cooperative: Cooperative;

  control(name: keyof OrderForm): UntypedFormControl {
    return this.form.get(name) as UntypedFormControl;
  }

  totalOrderDetails = 0;
  totalSum = 0;
  newItems: OrderDetail[] = [];
  actionForm: UntypedFormGroup;

  constructor(
    private metaDataService: MetadataService,
    public orderService: OrdersService,
    private datesService: DatesService,
    private schoolYearService: SchoolYearService,
    private route: ActivatedRoute,
    private router: Router,
    public datePipe: DatePipe,
    private cdRef: ChangeDetectorRef,

  ) { }

  ngOnInit() {
    this.orderService.orderTable=[]
    this.orderService.totalSum=0
    window.scrollTo(0, 0);
    this.cooperativeId$ = this.metaDataService.getCooperativeId();
    this.orderId$ = this.route.params.pipe(
      map(prms => Number(prms['orderId'])),
      // tap(val => console.log('Edit Order Component, order id = ', val))
    );

    this.isNew$ = this.orderId$.pipe(
      map(val => isNaN(val)),
      //tap(val => console.log('Edit Order Componet, is New = ', val))
    );

    this.order$ = combineLatest([this.orderId$, this.cooperativeId$]).pipe(
      switchMap(([orderId, cooperativeId]) => this.orderById(orderId, cooperativeId)),
      cache(),
      map(val => this.orderService.temp = val),
      //  tap(val => console.log('Edit Order Component, order Vm = ', val))
    );

    this.user$ = this.metaDataService.getUser().pipe(
      //tap(u=>console.log('USER  ',u.userId) ),
      map(user => this.user = user)
    );

    let busyTrue$ = combineLatest([this.cooperativeId$, this.orderId$]).pipe(mapTo(true));
    let busyFalse$ = this.order$.pipe(mapTo(false));

    // this.isBusy$ = merge(busyTrue$, busyFalse$).pipe(
    //   startWith(true),
    //   distinctUntilChanged());

    this.isAllowSetStatus$ = this.user$.pipe(
      map(val => !!val.isAllowSetOrderForAllStatuses),
      //tap(val => console.log('isAllowSetStatus', val))
    );

    this.initForm();

  }

  private orderById(orderId: number, cooperativeId: number): Observable<OrderVm> {
    if (Number.isNaN(orderId)) {
      return this.orderService.getDefaultOrder()
    }
    else {
      return this.orderService.getOrderById(orderId, cooperativeId);
    }
  }

  ngAfterViewChecked() {
    this.cdRef.detectChanges();
  }
  private async calcMinimumRequiredDate() {
    //if (this.user.roleId < 20) {//} (this.user.roleId >= 20) {
    let user = await this.user$.pipe(first()).toPromise();


    if (!user.isAllowOrderWithPastRequiredDate) {

      //var d = new Date();
      //d.setDate( d.getDate() + 1 );
      var d = new Date(/*this.form.get('requiredDate').value*/);
      d.setHours(0, 0, 0, 0);

      this.minimumLegalRequireDate = d.toISOString();
    } else {
      this.minimumLegalRequireDate = null;
    }
  }

  private initForm() {

    this.form = new UntypedFormGroup({
      orderId: new UntypedFormControl(null),
      orderStatusId: new UntypedFormControl(null),//({disable:true}),
      requiredDate: new UntypedFormControl(null, [Validators.required, DateValidators.minimumDate(() => this.minimumLegalRequireDate)]),
      //requiredDate: new FormControl(null),
      branchId: new UntypedFormControl(null, Validators.required),
      budgetId: new UntypedFormControl(null, Validators.required),
      projectId: new UntypedFormControl(null),
      supplierId: new UntypedFormControl(null, Validators.required),
      orderDescription: new UntypedFormControl(null, Validators.required),
      orderDetails: new UntypedFormArray([]),
      isSetStatusMode: new UntypedFormControl(null)
    });

    this.calcMinimumRequiredDate();

    this.cooperativeId = this.metaDataService.getCooperative().pipe(
      //tap(c=>console.log('COOPERATIVE   '+c.cooperativeId)),
      map(cooperative => this.cooperative = cooperative)

    )
    //console.log(this.cooperative);
    this.input=new Date(this.control('requiredDate').value);

    //   this.cooperative=this.cooperative.cooperativeId

    this.possibleAllOrderStatuses = this.metaDataService.getAllOrderStatuses().pipe(
    )
    //אם נשאר כך לעשות

    this.schoolYearOfRequiredDate$ = this.control('requiredDate').valueChanges.pipe(
      switchMap((d: Moment) => this.schoolYearService.getSchoolYearOfDate(!!d && !!d?.toDate ? d.toDate() : new Date())),
      map(result => this.schoolYearOfRequiredDate = result),

    );

    //this.isSetStatusMode$ = this.control('isSetStatusMode').valueChanges.pipe()
    //  map(val => val.),
    //  tap(val => console.log(" this.isSetStatusMode$"),this.control('isSetStatusMode').value)
    //);
    this.today = this.datePipe.transform(new Date(), 'yyyy-MM-dd');


    this.selectedBranchId = this.control('branchId').valueChanges.pipe(
      startWith(this.control('branchId').value),
      map(str => (str === null) ? null : Number(str))
    );

    this.selectedBudgetId = this.control('budgetId').valueChanges.pipe(
      startWith(this.control('budgetId').value),
      map(str => (str === null) ? null : Number(str))
    );

    this.selectedProjectId = this.control('projectId').valueChanges.pipe(
      startWith(this.control('projectId').value),
      map(str => (str === null) ? null : Number(str))
    );

    this.possibleBranches = this.metaDataService.getAllBranches();

    this.possibleBudgets = this.selectedBranchId.pipe(
      distinctUntilChanged(),
      switchMap(id => this.metaDataService.getAllBudgetsForBranch(id))
    );

    /* this.possibleProjects = this.selectedBudgetId.pipe(
       distinctUntilChanged(),
       switchMap(id => thisדmetaDataService.getAllProjectForBudgetAndSchoolYear(id))
     );//לשנות את השאיבה , לא שנה נוכחית אלא שנה המתאימה לתאריך אספקה
    */
    this.possibleProjects = combineLatest([this.selectedBudgetId, this.schoolYearOfRequiredDate$]).pipe(
      distinctUntilChanged(),
      switchMap(pair => this.metaDataService.getAllProjectsForBudgetAndSchoolYear(pair[0], pair[1].schoolYearId))
    );

    this.verifyOptionsListContainsSelected(
      this.possibleBranches, this.selectedBranchId,
      b => b.branchId, 'branchId'
    );

    this.verifyOptionsListContainsSelected(
      this.possibleBudgets, this.selectedBudgetId,
      b => b.budgetId, 'budgetId'
    );

    this.verifyOptionsListContainsSelected(
      this.possibleProjects, this.selectedProjectId,
      p => p.projectId, 'projectId'
    );

    this.subs.push(
      this.cooperativeId.pipe(
        distinctUntilChanged(),
        skip(1)
      ).subscribe(_ => {
        this.onNewOrderClicked();
      }));


    let onSave$ = this.saveAction.pipe(
      withLatestFrom(this.cooperativeId, this.user$, (_, coop, user) => { return { coomperative: coop, user: user } })
    );


    // this.order$ = this.orderId$.pipe(
    //   withLatestFrom(this.cooperativeId$.pipe(tap(val => console.log('coop id', val)))),
    //   tap(_ => this.setBusy(true)),
    //   switchMap(pair => this.orderById(pair[0],pair[1])),

    //   //switchMap(id => this.orderById(id)),
    //   tap(val => console.log('order vm: ', val)),
    //   tap(_ => this.setBusy(false))
    // );

    this.orderStatus$ = combineLatest([this.order$, this.possibleAllOrderStatuses]).pipe(
      //map(pair => {return {order: pair[0], orderStatuses: pair[1]}},
      switchMap(pair => pair[1].filter(os => os.orderStatusId === pair[0].orderStatusId)),
      //  tap(val => console.log('order status = ', val))
    );

    // order is printable when !isNew and:
    // 1. user.isResetUSer
    // or
    // 2. order.statusId between 100 and 130
    this.isPrintable$ = combineLatest([this.user$, this.order$, this.isNew$]).pipe(
      map(tpl => { return { user: tpl[0], order: tpl[1], isNew: tpl[2] } }),
      map(val => (!val.isNew) &&
        ((val.user.isReshetUser === 1)
          || (val.order.orderStatusId >= 100 && val.order.orderStatusId < 130))),
    );


    this.subs.push(this.order$.subscribe(orderVm => {
      this.resetValueOfForm(orderVm);
    }));

    this.subs.push(this.orderStatus$.subscribe(os => {
    }));

    this.subs.push(onSave$.subscribe(tpl => {
      // if (this.possibleProjects && this.control("projectId").value==null)
      // {
      //   var res = confirm("לא נבחר פרויקט, האם ברצונך לבחור פרויקט")
      // }
      // if (res == false)
      // {
      let order = this.FormModelToViewModel(this.form.value as OrderForm, tpl.coomperative.cooperativeId, tpl.user);
      this.saveOrder(order);
      // }
    }));

  }

  private verifyOptionsListContainsSelected<T, K>(
    onOptions: Observable<T[]>,
    onSelected: Observable<K>,
    keySelector: (t: T) => K,
    fieldName: keyof OrderForm
  ): void {
    let onWrong = onOptions.pipe(
      withLatestFrom(onSelected),
      filter(pair => pair[1] !== null),
      filter(pair => !pair[0] || !pair[0].some(t => keySelector(t) === pair[1])),
      map(() => { })
    );

    let subscription = onWrong.subscribe(
      _ => {
        this.control(fieldName).setValue(null);
      }
    )

    this.subs.push(
      subscription
    );

  }

  ngOnDestroy(): void {
    this.subs.forEach(s => {
      s.unsubscribe();
    });
    this.subs = [];
  }

  private FormModelToViewModel(orderForm: OrderForm, cooperativeId: number, user: User): OrderVm {
    let orderId = orderForm.orderId;
    if (orderForm.orderId == null) {
      orderId = -1;
    }
    let orderToSave: OrderVm = {
      orderId: orderId,
      requiredDate: orderForm.requiredDate,
      cooperativeId: cooperativeId,
      branchId: orderForm.branchId,
      budgetId: orderForm.budgetId,
      projectId: orderForm.projectId,
      //supplierId: orderForm.supplier.supplierId,
      supplierId: orderForm.supplierId,
      orderStatusId: orderForm.orderStatusId,
      //orderStatus: null,
      orderDescription: orderForm.orderDescription,
      orderDetails: this.orderService.orderTable,
      isSetStatusMode: orderForm.isSetStatusMode,
      doneBy: user.userId
    };

    return orderToSave;
  }

  private fixOrderVm(original: OrderVm): OrderVm {

    if (this.orderService.temp.orderId) {
      this.orderService.editFlag = true
      this.orderService.orderTable = this.orderService.temp?.orderDetails
      this.orderService.finishOrder();

    }

    let res = { ...original }
    if (res.orderDetails === null) {
      res.orderDetails = [];
    }

    res.requiredDate = this.datesService.dateTimeToDate(original.requiredDate);

    return res;
  }

  private matchToOrderForm(order: OrderVm): OrderForm {

    let res: OrderForm = {
      orderId: order.orderId,
      orderStatusId: order.orderStatusId,
      requiredDate: order.requiredDate,
      branchId: order.branchId,
      budgetId: order.budgetId,
      projectId: order.projectId,
      supplierId: order.supplierId,
      orderDescription: order.orderDescription,
      orderDetails: order.orderDetails,
      isSetStatusMode: order.isSetStatusMode
    };
    return res;
  }


  public async saveOrder(orderToSave: OrderVm) {
    this.orderService.flag = false;


    try {
      let res = await this.orderService.saveOrder(orderToSave);
      alert('\n\n ההזמנה נשמרה בהצלחה !!!' + '\n\n מספר ההזמנה הוא ' + res.orderId + '\n\n סטטוס ההזמנה הינו ' + res.orderStatusId);
      this.control('orderStatusId').setValue(res.orderStatusId);
      this.router.navigate(['orders', 'edit', res.orderId]);
      window.scrollTo(0, 0);
      this.control('orderStatusId').setValue(res.orderStatusId);
      this.control('isSetStatusMode').setValue(res.isSetStatusMode);
    }
    catch (Error) {
      alert('לצערינו שמירת ההזמנה נכשלה \n' + Error.message);
      console.log(Error);
    }
    this.orderService.flag = true;
  }

  setValueOfForm(value: OrderVm) {
    let valForm = this.matchToOrderForm(value);
    this.buildOrderDetailsGroup(valForm.orderDetails.length);
    //this.control('supplier').setValue(valForm.supplier);
    this.form.setValue(valForm);
    //this.control('supplier').setValue(valForm.supplier);
  }

  delay(millis): Promise<void> {
    return new Promise<void>(resolve => setTimeout(resolve, millis));
  }

  async resetValueOfForm(orderVm: OrderVm) {
    orderVm = this.fixOrderVm(orderVm);


    let orderForm = this.matchToOrderForm(orderVm);


    await this.delay(350);
    this.buildOrderDetailsGroup(orderForm.orderDetails.length);
    this.form.reset(orderForm);

    // if ((orderVm.orderId === null) && (orderVm.orderDetails.length === 0)) {
    //   this.addOrderDetailGroup();
    // }
    console.groupEnd();
  }


  onSaveClicked() {
    this.saveAction.next();
  }

  onNewOrderClicked() {
    this.orderService.orderTable = []
    this.orderService.totalSum = 0
    this.router.navigate(['orders', 'edit']);

  }

  // async onPrintClicked(){
  //   this.router.navigate(['order']);
  // }
  onChange() {
    if (this.actionForm) {
      this.actionForm.markAsTouched();
    }
  }

  printOrder() {
    let orderId = this.control('orderId').value;
    this.router.navigate([`/orders/print/${orderId}`]);
    /*
    const url = this.router.serializeUrl(
      this.router.createUrlTree([`../orders/print/${orderId}`])
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
  /*
  nisayon1(){
    this.router.navigate(['nisayon']);
  }

  nisayonNew2(){
    let url = this.router.createUrlTree(['nisayon']);
    window.open(url.toString(), '_blank');
  }

  nisayon3(){
    this.router.navigate(['order-print',100003, 1]);
  }
  */

  //#region handling the form array
  getOrderDetailsArray(): UntypedFormArray {
    return this.control('orderDetails') as unknown as UntypedFormArray;
  }

  deleteOrderDetailGroup(i: number) {
    this.getOrderDetailsArray().removeAt(i);
  }

  // addOrderDetailGroup(): UntypedFormGroup {
  //   const group = new UntypedFormGroup({
  //     orderDetailDescription: new UntypedFormControl(""),
  //     quantity: new UntypedFormControl(1),
  //     unitPrice: new UntypedFormControl(0)
  //   });
  //   this.getOrderDetailsArray().push(group);

  //   return group;
  // }

  buildOrderDetailsGroup(count: number) {
    // if there are not enough, build more
    const array = this.getOrderDetailsArray();
    // while (array.length < count)
    //   this.addOrderDetailGroup();

    while (array.length > count) {
      this.deleteOrderDetailGroup(array.length - 1);
    }
  }

  budgetBalance$: Observable<any>
  date: any
  async getBudgetBalance() {
    this.date = this.form.controls.requiredDate.value

    this.budgetBalance$ = await this.orderService.getBudgetBalance(this.form.controls.budgetId.value, this.form.controls.branchId.value, this.schoolYearOfRequiredDate.schoolYearId, this.datePipe.transform(new Date(this.form.controls.requiredDate.value), 'yyyy-MM-dd'), this.user.userId, this.cooperative.cooperativeId)
    await this.budgetBalance$.pipe(
      map(async result => {
        this.budgetBalance = result[0]
      }),

    ).subscribe()


    this.quater = await this.orderService.getQuater(this.date)
    await this.delay(500);
    // nextTick(()=>{
    this.getBudgetBalanceByQuater()
    // })
  }

  async getBudgetBalanceByQuater() {

    switch (this.quater) {
      case 1:
        this.budgetBalanceByQuater = this.budgetBalance?.firstQuarterBudgetBalance

        break;
      case 2:
        this.budgetBalanceByQuater = this.budgetBalance?.secondQuarterBudgetBalance

        break;
      case 3:
        this.budgetBalanceByQuater = this.budgetBalance?.thirdQuarterBudgetBalance

        break;
      case 4:
        this.budgetBalanceByQuater = this.budgetBalance?.fourthYearBudgetBalance

        break;
      default:
        console.log("Error");

        break;



    }

  }

  //#endregion

}


