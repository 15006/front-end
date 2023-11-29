import { Component, Input, OnChanges, OnDestroy, OnInit, SimpleChanges, ViewChild } from '@angular/core';
//import { MatPaginator, MatPaginatorIntl } from '@angular/material/paginator';
//import { CustomInvoiceActionPaginator } from './custom-invoice-action-paginator';
//import {MatPaginatorModule} from '@angular/material/paginator';
//import {MatListModule} from '@angular/material/list';
//import { ɵINTERNAL_BROWSER_DYNAMIC_PLATFORM_PROVIDERS } from '@angular/platform-browser-dynamic';
 import { FormArray, UntypedFormControl, UntypedFormGroup, Validators } from '@angular/forms';
import { combineLatest,Observable, Subject } from 'rxjs';
import {  distinct, distinctUntilChanged, filter, map, startWith, switchMap, takeUntil, tap } from 'rxjs/operators';
import { Branch } from 'src/app/core/entities/branch';
import { Budget } from 'src/app/core/entities/budget';
 import { InvoiceActionForm, InvoiceActionStatus } from 'src/app/core/entities/invoice';
import { Order, OrderVm } from 'src/app/core/entities/order';
import { Project } from 'src/app/core/entities/project';
import { SchoolYear } from 'src/app/core/entities/school-year';
import { DatesService } from 'src/app/core/services/dates.service';
import { InvoiceService } from 'src/app/core/services/invoice.service';
import { MetadataService } from 'src/app/core/services/metadata.service';
import { SchoolYearService } from 'src/app/core/services/school-year.service';
import { DateValidators } from 'src/app/core/validators/date-validators';
//import { validateHorizontalPosition } from '@angular/cdk/overlay';
 



@Component({
  selector: 'app-invoice-action-part',
  templateUrl: 'invoice-action-part.component.html',
  styleUrls: ['./invoice-action-part.component.scss'],
  
    // { provide: MatPaginatorIntl, useValue: CustomInvoiceActionPaginator() },
    // { provide: MatPaginatorModule, useValue: CustomInvoiceActionPaginator() }
  
})
export class InvoiceActionPartComponent implements OnInit,OnDestroy {


 // @Input() order$:Observable<OrderVm>;

  @Input() 
  set invoiceActionForm(val : UntypedFormGroup)
  {
    this.localForm = val;
  }

  localForm: UntypedFormGroup;

  destroy$ = new Subject<void>();

  form :UntypedFormGroup;
  orderDate:Date;
  canChangeOrder:boolean;
  canInsertInvoiceWithOutOrder:boolean;
  
  orderRequiredDate$:Observable<string>;

  possibleBranches$:Observable<Branch[]>;
  possibleBudgets$:Observable<Budget[]>;
  possibleProjects$:Observable<Project[]>;

  possibleInvoiceActionStatus$:Observable<InvoiceActionStatus[]>;

  selectedBranchId$:Observable<number>;
  selectedBudgetId$:Observable<number>;
  selectedProjectId$:Observable<number>;

  schoolYearByValueDate$:Observable<SchoolYear>;
  minDateByRoll:Date;

  constructor(private metaDataService:MetadataService,private schoolYearService:SchoolYearService,private datesService:DatesService,
    private invoiceService:InvoiceService) { }

  ngOnInit(): void {
    //   this.initForm();
    //   this.order$.pipe(
    //     filter(o=> o !== null ),
    //     filter(o=> o !== undefined),
    //     filter(o=> typeof(o)==='object'),
    //     takeUntil(this.destroy$)
    //   ).subscribe(val => this.myFormByOrder(val))
   }

  // myFormByOrder(val: OrderVm)
  // {
  //   //console.log("fill form by order !!!!",val)
  //   let invoiceForm = this.matchToInvoiceActionForm(val);
  //   this.form.reset(invoiceForm);
  // }
  // initForm()
  // {
  //   var valueDate = new Date();
  //   valueDate.setHours(0,0,0,0);
  //   //console.log('please fill value date from order !!!!!!!!!!!!!!!!!!!!!!!');
  //   this.minDateByRoll = valueDate;
  //   console.log('please clclate roll min date');
    
  //   //console.log('please fill orderId from order !!!!!!!!!!!!!!!!!!!!!!!');

  //   this.form =  new FormGroup({
  //     branchId : new FormControl(null,Validators.required),
  //     budgetId: new FormControl(null,Validators.required),
  //     projectId: new FormControl(null,Validators.required),
  //     valueDate: new FormControl(valueDate,[Validators.required,DateValidators.minimumDate(()=> this.minDateByRoll.toISOString())]),
  //     invoiceActionStatusId: new FormControl(-1/*בחירת מערכת*/ ,Validators.required),
  //     invoiceActionDescription: new FormControl(null,Validators.required),
  //     orderId: new FormControl(null,Validators.required),
  //     //orderDate: new FormControl(null,Validators.required),
  //    })

  //   this.schoolYearByValueDate$ = this.control('valueDate').valueChanges.pipe(
  //     startWith(this.control("valueDate").value),
  //     switchMap(d => this.schoolYearService.getSchoolYearOfDate(d))//,
  //   )

  
  //   // this.schoolYearOfRequiredDate = this.control('requiredDate').valueChanges.pipe(
  //   //   switchMap(d => this.schoolYearService.getSchoolYearOfDate(d))
  //   // );

  //    this.possibleBranches$ = this.metaDataService.getAllBranches();

  //    this.selectedBranchId$ = this.control("branchId").valueChanges.pipe(
  //      startWith(this.control("branchId").value),
  //      map(val => (val === null)? null: Number(val))
  //    ) 

  //    this.possibleBudgets$ = this.selectedBranchId$.pipe(
  //       distinctUntilChanged(),
  //       switchMap(bId=> this.metaDataService.getAllBudgetsForBranch(bId))
  //    );

  //    this.selectedBudgetId$ = this.control("budgetId").valueChanges.pipe(
  //      startWith(this.control("budgetId").value),
  //      map(val => (val === null)?null:Number(val))
  //    )

   
  //    this.possibleProjects$ = combineLatest([this.selectedBudgetId$, this.schoolYearByValueDate$]).pipe(
  //     distinctUntilChanged(),
  //     switchMap(pair => this.metaDataService.getAllProjectsForBudgetAndSchoolYear(pair[0], pair[1].schoolYearId))
  //   );
     
  //   this.orderRequiredDate$ = this.order$.pipe(
  //     map(o => this.datesService.dateTimeToDate(o.requiredDate))
  //   );

  //   this.possibleInvoiceActionStatus$ = this.invoiceService.getInvoiceActionStatusForEdit();

  // }

   ngOnDestroy(): void {
  //   this.destroy$.next();
   }  

  control(name :keyof InvoiceActionForm):UntypedFormControl{
    return this.form.get(name) as UntypedFormControl;
  }

  // private matchToInvoiceActionForm(order:OrderVm):InvoiceActionForm{
    
  //  // console.log(order.orderId, "orderId ^ matchToInvoiceActionForm" )

  //   let res: InvoiceActionForm = {
  //     invoiceId: null,
  //     invoiceActionId:null,
  //     branchId: order.branchId,
  //     budgetId: order.budgetId,
  //     projectId: order.projectId,
  //     valueDate: this.datesService.dateTimeToDate(order.requiredDate) ,
  //     invoiceActionStatusId:-1,
  //      invoiceActionDescription:order.orderDescription,
  //     orderId:order.orderId,
  //     statusDate:null//now???
     
  //   };
  //   return res;
  // }


}

