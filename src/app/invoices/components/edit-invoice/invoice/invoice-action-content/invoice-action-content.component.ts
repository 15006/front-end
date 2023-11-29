import { Component, OnInit, Output, Input, EventEmitter, ViewChild, ChangeDetectorRef, SimpleChanges } from '@angular/core';
// import { FormBuilder,  UntypedFormGroup, UntypedFormControl, Validators } from '@angular/forms';
import { Branch } from '@app/core/entities/branch';
import { Budget } from '@app/core/entities/budget';
import { Project } from '@app/core/entities/project';
import { InvoiceStateService } from '@app/core/services/invoice-state.service';
import { ProjectService } from '@app/core/services/project.service';
import { Observable } from 'rxjs';
import { InvoiceActionStatus, InvoiceActionVm, InvoiceItemVm, InvoiceVm } from 'src/app/core/entities/invoice';
import { distinctUntilChanged, filter, first, map, mapTo, skip, startWith, switchMap, tap, withLatestFrom } from 'rxjs/operators';
import { MetadataService } from '@app/core/services/metadata.service';
import { SchoolYearService } from '@app/core/services/school-year.service';
import { SchoolYear } from '@app/core/entities/school-year';
import { combineLatest } from 'rxjs';
import { deepCloneArray } from '@app/shared/tools/clone';
import { InvoiceService } from '@app/core/services/invoice.service';
import { User } from '@app/core/entities/user';
import { UserService } from '@app/core/services/user.service';
import { ConfirmDialogComponent, DialogData as ConfirmDialogData } from '@app/shared/ui/confirm-dialog/confirm-dialog.component';
import { MatDialog } from '@angular/material/dialog';
import { ActivatedRoute, Router } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';
import { InvoiceActionItemsComponent } from '../invoice-action-items/invoice-action-items.component';
import { UntypedFormGroup, FormBuilder, UntypedFormControl, Validators } from '@angular/forms';
import * as moment from 'moment';

export const DEFAULT_ITEM: InvoiceItemVm = {
  quantity: 1,
  unitPrice: 0,
} as InvoiceItemVm;
export const DEFAULT_ITEMS: InvoiceItemVm[] = [
  DEFAULT_ITEM
];

@Component({
  selector: 'app-invoice-action-content',
  templateUrl: './invoice-action-content.component.html',
  styleUrls: ['./invoice-action-content.component.scss']
})
export class InvoiceActionContentComponent implements OnInit {
  actionForm: UntypedFormGroup;
  invoice: InvoiceVm;
  possibleBranches: Observable<Branch[]>;
  possibleBudgets: Observable<Budget[]>;
  possibleProjects: Observable<Project[]>;
  schoolYearOfRequiredDate: Observable<SchoolYear>;
  beforeExtractDataFlag: boolean = false

  selectedBranchId: Observable<number>;
  selectedBudgetId: Observable<number>;
  selectedProjectId: Observable<number>;
  user: User;
  newItems: InvoiceItemVm[] = []; 
  possibleInvoiceActionStatuses$: Observable<InvoiceActionStatus[]>;
  input: any;


  constructor(
    private stateService: InvoiceStateService,
    private metaDataService: MetadataService,
    private schoolYearService: SchoolYearService,
    public invoiceService: InvoiceService,
    private formBuilder: FormBuilder,
    public dialog: MatDialog,
    private userService: UserService,
    private route: ActivatedRoute,
    private snackBar: MatSnackBar,
    private router: Router,
    private cdRef: ChangeDetectorRef,
    private projectService: ProjectService
  ) { }
  control(name: string): UntypedFormControl {
    return this.actionForm.get(name) as UntypedFormControl;
  }
  get action() {
    return this.stateService.selectedAction;
  }
  ngAfterViewChecked() {
    this.cdRef.detectChanges();
  }
  @ViewChild(InvoiceActionItemsComponent) InvoiceActionItemsComp: InvoiceActionItemsComponent;

  valid_numbers(e: any) {
    return this.metaDataService.valid_numbers(e);
  }
  save(): boolean {
    this.actionForm.markAsDirty();
    this.actionForm.markAsTouched();
    this.actionForm.markAllAsTouched();
    if (this.actionForm.valid
      // && (!this.totalSum || this.actionSum <= this.totalSum)
    ) {
      this.InvoiceActionItemsComp.emitItems()
      const i = this.stateService.invoice.invoiceActions.indexOf(this.stateService.selectedAction);
      this.stateService.invoice.invoiceActions[i].items = this.newItems;
      this.stateService.invoice.invoiceActions[i] = {
        ...this.stateService.invoice.invoiceActions[i],
        ...this.actionForm.value,
      }
      this.stateService.setValue(this.stateService.invoice);
      return true;
    }
    return false;

  }
  get invoice$() {
    return this.stateService.getObservable();
  }
  get action$() {
    return this.stateService.getSelectedActionObservable();
  }
  get userId$() {
    return this.metaDataService.getUser();
  }
  get totalSum() {
    return this.stateService.totalSum;
  }
  get actionSum() {
    return this.stateService.actionSum;
  }
  get isReshetUser() {
    if (!this.metaDataService.isReshetUser)
      this.metaDataService.isReshetUser = this.userService.isNetworkAdmin(this.user);
    return this.metaDataService.isReshetUser;
  }
  ifInvoiceActionStatusIdTouched() {
    this.invoiceService.isInvoiceActionStatusIdTouched = true; //for Edna;;;;;;;;;;; :()
  }

  async ngOnInit() {
    this.invoice = this.stateService.invoice;
    this.userId$.subscribe(u => {
      this.user = u;
      this.isReshetUser;
      if (this.stateService.selectedAction.invoiceActionStatusId === null) {
        this.stateService.selectedAction.invoiceActionStatusId = -1
      }
      this.actionForm = this.formBuilder.group({
        branchId: new UntypedFormControl({ disabled: !this.isReshetUser, value: this.stateService.selectedAction?.branchId || this.user.branchId }, [Validators.required, Validators.min(1)]),
        budgetId: new UntypedFormControl({ disabled: !this.isReshetUser, value: this.stateService.selectedAction?.budgetId }, [Validators.required, Validators.min(1)]),
        projectId: new UntypedFormControl(this.stateService.selectedAction?.projectId),
        orderId: new UntypedFormControl({ value: this.stateService.selectedAction?.orderId, disabled: !this.isReshetUser }),
        invoiceActionStatusId: new UntypedFormControl({
          disabled: (!this.isReshetUser && (this.stateService.selectedAction?.invoiceActionStatusId === 79 || this.stateService.selectedAction?.invoiceActionStatusId === 78)),
          value: ((this.stateService.selectedAction?.invoiceActionStatusId === null) || (this.stateService.selectedAction?.invoiceActionStatusId === undefined)) ? -1 : this.stateService.selectedAction?.invoiceActionStatusId
        }),
        valueDate: new UntypedFormControl(this.stateService.selectedAction?.valueDate, Validators.required),
        orderDate: new UntypedFormControl({ disabled: true, value: this.stateService.selectedAction?.orderDate }, Validators.required),
        description: new UntypedFormControl(this.stateService.selectedAction?.description),
      }, {
        validators: [
          (form: UntypedFormGroup) => {
            if (form.get('valueDate').value && form.get('orderDate').value && (new Date(form.get('valueDate').value) < new Date(form.get('orderDate').value))) {
              return { dateMismatch: 'תאריך ערך לא יכול להיות לפני תאריך אספקה של הזמנה' };
            }
            return null;
          },
          // (form: UntypedFormGroup) => {

          //   if (!this.isReshetUser && form.get('invoiceActionStatusId').value > 10 ) {
          //     return {
          //       invoiceActionStatusId: 'הינך יכול לבחור מבין ארבעת האופציות הראשונות. אם תבחר קביעת המערכת, המערכת תקבע את הסטטוס המתאים'
          //     };
          //   }
          //   return null;
          // },
          (form: UntypedFormGroup) => {
            if (this.invoiceService.possibleProjectsValue?.length > 0 && !form.get('projectId').value) {
              return {
                projectId: 'חובה לבחור פרויקט'
              }
            }
            return null;
          },
          (form: UntypedFormGroup) => {
            if ([0, 74].includes(form.get('invoiceActionStatusId').value) && !form.get('description').value) {
              return {
                description: 'חובה להזין תיאור'
              }
            }
            return null;
          }
        ],
      });
      this.loadData();
      this.newItems = !!this.stateService.selectedAction?.items?.length ? deepCloneArray(this.stateService.selectedAction.items) : DEFAULT_ITEMS;
      this.possibleProjects.subscribe(s => {
        this.invoiceService.possibleProjectsValue = s;
      });

      this.stateService.getObservable().subscribe(() => this.onChangeData());
      this.stateService.getSelectedActionObservable().subscribe(() => this.onChangeData());

    });


  }
  onChangeData() {
    if (!!this.stateService?.selectedAction) {
      if (this.stateService.selectedAction.invoiceActionStatusId === null) {
        this.stateService.selectedAction.invoiceActionStatusId = -1
      }
      const s = this.stateService.selectedAction;
      this.actionForm.reset({
        branchId: s?.branchId,
        budgetId: s?.budgetId,
        projectId: s?.projectId,
        projectNum: s?.projectNum,
        orderId: s?.orderId,
        invoiceActionStatusId: s?.invoiceActionStatusId, //|| -1,
        valueDate: s?.valueDate,
        orderDate: s?.orderDate,
        description: s?.description
      });
      this.actionForm.markAsPristine();
      this.newItems = deepCloneArray(s.items || DEFAULT_ITEMS);
    }
  }
  get errorArray() {
    return this.actionForm?.errors ? Object.keys(this.actionForm.errors).map(key => this.actionForm.errors[key]) : [];
  }
  isDirty() {
    return this.actionForm.dirty && this.InvoiceActionItemsComp.dirty;
  }
  onChange() {
    if (this.actionForm) {
      this.actionForm.markAsTouched();
    }
  }

  onUpdateItems(items: InvoiceItemVm[]) {
    this.newItems = deepCloneArray(items);
  }
  retrieveOrder() {
    this.invoiceService.invoiceId = this.invoice.invoiceId
    // this.invoiceService.flagInvoiceByOrder=true
    this.invoiceService.retrieveOrderFlag = true;
    this.invoiceService.dirty = false
    if (!!this.actionForm.get('orderId').value) {
      const dialogRef = this.dialog.open(ConfirmDialogComponent, {
        width: '350px',
        hasBackdrop: true,
        data: {
          title: 'האם אתה בטוח שאתה רוצה לשלוף פרטי הזמנה??',
          cancelText: 'לא',
          confirmText: 'כן',
          message: 'לחיצה על כן ימחוק את השינויים שנעשו לפעולה'
        } as ConfirmDialogData,
      });

      dialogRef.afterClosed().subscribe((result: boolean) => {
        if (result) {
          this.router.navigateByUrl('/', { skipLocationChange: true }).then(() => {
            // this.router.navigateByUrl(`/invoices/edit/${this.stateService.invoice.invoiceId || ''}?orderId=${this.actionForm.get('orderId').value}`);

            this.router.navigateByUrl(`/invoices/edit/${this.stateService.invoice.invoiceId || ''}?orderId=${this.actionForm.get('orderId').value}`, { skipLocationChange: true });

            this.invoiceService.dirty = true
          });
        }
      });
    } else {
      let snack = this.snackBar.open('חובה להזין מספר הזמנה', 'סגור');
    }
  }
  loadData() {
    this.input = new Date(this.control('valueDate').value);
    // this.schoolYearOfRequiredDate = this.schoolYearService.getSchoolYearOfDate(this.action$.pipe(
    //   map(m => m.valueDate),
    // ));
    this.schoolYearOfRequiredDate = this.control('valueDate').valueChanges.pipe(
      switchMap((d: string) => this.schoolYearService.getSchoolYearOfDate(new Date(d))),
    );

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
      map(str => (str === null) ? null : Number(str)),
    );

    this.possibleBranches = this.metaDataService.getAllBranches();

    this.possibleBudgets = this.selectedBranchId.pipe(
      distinctUntilChanged(),
      switchMap(id => this.metaDataService.getAllBudgetsForBranch(id))
    );

    this.possibleProjects = combineLatest([this.selectedBudgetId, this.schoolYearOfRequiredDate]).pipe(
      distinctUntilChanged(),
      switchMap(pair => this.metaDataService.getAllProjectsForBudgetAndSchoolYear(pair[0], pair[1].schoolYearId))
    );

    this.possibleInvoiceActionStatuses$ = this.metaDataService.getActionStatuses();


    this.selectedBranchId.subscribe(s => {
      if (this.actionForm && !!s && s !== this.stateService?.selectedAction?.branchId) {
        this.actionForm.get('budgetId').setValue(null);
        this.actionForm.get('projectId').setValue(null);
      }
    });

    this.selectedBudgetId.subscribe(s => {
      if (this.actionForm && !!s && s !== this.stateService?.selectedAction?.budgetId) {
        this.actionForm.get('projectId').setValue(null);
      }
    });


  }

}
