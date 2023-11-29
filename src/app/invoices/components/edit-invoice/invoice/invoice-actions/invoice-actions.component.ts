import { BreakpointObserver, BreakpointState } from '@angular/cdk/layout';
import { ChangeDetectorRef, Component, EventEmitter, Input, OnInit, Output, ViewChild } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { ConfirmDialogComponent, DialogData as ConfirmDialogData } from '@app/shared/ui/confirm-dialog/confirm-dialog.component';
import { InputPromptDialogComponent, DialogData as InputPromptDialogData } from '@app/shared/ui/input-prompt-dialog/input-prompt-dialog.component';
import { InvoiceStateService } from '@app/core/services/invoice-state.service';
import { MetadataService } from '@app/core/services/metadata.service';
import { combineLatest, Observable, } from 'rxjs';
import { filter, map, mergeAll, switchMap, takeUntil, tap, distinctUntilChanged } from 'rxjs/operators';
import { InvoiceActionStatus, InvoiceActionVm, InvoiceVm } from 'src/app/core/entities/invoice';
import { InvoiceActionContentComponent } from '../invoice-action-content/invoice-action-content.component';
import { PatternValidator, UntypedFormControl, Validators } from '@angular/forms';
import { Branch } from '@app/core/entities/branch';
import { Budget } from '@app/core/entities/budget';
import { Project } from '@app/core/entities/project';
import { SchoolYearService } from '@app/core/services/school-year.service';
import { UserService } from '@app/core/services/user.service';
import { Router } from '@angular/router';


@Component({
  selector: 'app-invoice-actions',
  templateUrl: './invoice-actions.component.html',
  styleUrls: ['./invoice-actions.component.scss']
})
export class InvoiceActionsComponent implements OnInit {

  opened: boolean = true;
  mode: 'side' | 'over' | 'push' = 'side';

  @ViewChild(InvoiceActionContentComponent) invoiceActionContent: InvoiceActionContentComponent;

  possibleBranches: Observable<Branch[]>;
  possibleBudgets: Observable<Budget[]>;
  possibleProjects: Observable<Project[]>;
  possibleStatuses: Observable<InvoiceActionStatus[]>;


  constructor(
    private breakpointObserver: BreakpointObserver,
    private userService: UserService,
    private invoiceState: InvoiceStateService,
    private schoolYearService: SchoolYearService,
    public metadataService: MetadataService,
    public dialog: MatDialog,
    private router: Router,
    private cdRef: ChangeDetectorRef,

  ) {
    // detect screen size changes
    this.breakpointObserver.observe([
      "(max-width: 768px)"
    ]).subscribe((result: BreakpointState) => {
      if (this.invoiceState.invoice?.invoiceActions?.length > 1) {
        if (result.matches) {
          // hide stuff
          this.mode = 'over';
          this.opened = false;
          this.breakpointObserver.ngOnDestroy();
        } else {
          // show stuff
          this.mode = 'side';
          this.opened = true;
          this.breakpointObserver.ngOnDestroy();
        }
      } else {
        this.opened = false;
      }
    });
  }

  addAction() {
    this.metadataService.addActionFlag=true;
    this.metadataService.getUser().pipe(
      map(user => this.userService.isNetworkAdmin(user)),
      map(user=>this.metadataService.isReshetUser=user )
    ).subscribe(isReshetUser => {
      if (isReshetUser) {
        this.invoiceState.invoice.invoiceActions.push({
          description: 'ללא תיאור',
        } as InvoiceActionVm);
        this.opened = true;
        this.invoiceState.setSelectedAction(this.invoiceState.invoice.invoiceActions[this.invoiceState.invoice.invoiceActions.length - 1]);
      } else
      this.router.navigateByUrl('/', { skipLocationChange: true }).then(() => {
        this.router.navigateByUrl(`/orders/search?invoiceId=${this.invoiceState.invoice.invoiceId}`);
      });
    }); 
    // const dialogRef = this.dialog.open(InputPromptDialogComponent, {
    //   width: '350px',
    //   hasBackdrop: true,
    //   data: {
    //     title: 'בחר מס הזמנה',
    //     cancelText: 'ביטול',
    //     label: "מספר הזמנה",
    //     confirmText: 'בחר',
    //     message: 'הוספת פעולה חדשה תמחק את השינויים שנעשו בדף',
    //     html: `אם לא ידוע מס' הזמנה ניתן לבחור <a class='text-blue-500 text-underline' href='/orders/search?invoiceId=${this.invoiceState.invoice.invoiceId}'>כאן</a>`,
    //     errors: {
    //       pattern: 'מספר הזמנה חייב להיות מספר',
    //       required: 'חובה להזין מספר הזמנה'
    //     },
    //     input: new UntypedFormControl('', [Validators.required, Validators.pattern('^[0-9]*$')]),
    //   } as InputPromptDialogData,
    // });

    // dialogRef.afterClosed().subscribe((result: { input: string }) => {
    //   if (result) {
    //     window.location.href = `/invoices/edit/${this.invoice.invoiceId}/?orderId=${result.input}`;
    //     // this.invoiceState.invoice.invoiceActions.push({
    //     //   description: 'ללא תיאור',
    //     // } as InvoiceActionVm);
    //     // this.opened = true;
    //   }
    // });
    // this.invoiceState.setValue();
  }
  selectInvoiceAction(item: InvoiceActionVm) {
    if (this.invoiceActionContent.isDirty()) {
      const dialogRef = this.dialog.open(ConfirmDialogComponent, {
        width: '350px',
        hasBackdrop: true,
        data: {
          title: 'האם אתה בטוח שאתה רוצה לעבור לפעולה אחרת לפני שמירה?',
          cancelText: 'לא',
          confirmText: 'כן',
          message: 'לחיצה על כן ימחוק את השינויים שנעשו לפעולה'
        } as ConfirmDialogData,
      });

      dialogRef.afterClosed().subscribe((result: boolean) => {
        if (result) {
          this.invoiceState.setSelectedAction(item);
          if (this.mode === 'over') {
            this.opened = false;
          }
        }
      });
    } else {
      this.invoiceState.setSelectedAction(item);
      if (this.mode === 'over') {
        this.opened = false;
      }
    }

  }

  get selectedInvoiceAction() {
    return this.invoiceState.selectedAction;
  }

  onInvoiceActionUpdate(e: InvoiceActionVm) {
    // const data = [...this.invoiceActions];
    // data.splice(this.selectedInvoiceActionIndex,1,e);
    // this.onInvoiceUpdate.emit(data)
  }


  get invoice() {
    return this.invoiceState.invoice;
  }
  sumAction(action: InvoiceActionVm, showVat: boolean = false) {
    return this.metadataService.getMaam().pipe(
      map(maam => {
        return action.items?.length ? (action.items.reduce((acc, item) => acc + ((item.quantity * item.unitPrice) || 0), 0)) : 0;
      })
    )
  }
  ngOnInit(): void {
    this.metadataService.getUser().pipe(
      map(user => this.userService.isNetworkAdmin(user)),
      map(user=>this.metadataService.isReshetUser=user )).subscribe();
    if (window.innerWidth < 768) {
      this.mode = 'over';
      this.opened = false;
    }
    const action$ = this.invoiceState.getSelectedActionObservable();

    // const schoolYearOfRequiredDate = this.schoolYearService.getSchoolYearOfDate(action$.pipe(
    //   map(m => m.valueDate)
    // ));
    this.possibleBranches = this.metadataService.getAllBranches();
    this.possibleBudgets = this.metadataService.getAllBudgets();
    this.possibleProjects = this.metadataService.getAllProjects();
    this.possibleStatuses = this.metadataService.getActionStatuses();
    // this.invoiceState.getObservable().subscribe((invoice: InvoiceVm) => {
    //   this.invoice = invoice;
    // });
    // this.invoice$.subscribe(s => {
    //   if (s.invoiceActions.length)
    //     this.invoiceState.setSelectedAction(s.invoiceActions[0]);
    // });
    action$.subscribe(s => {
      if (this.mode === 'side') {
        this.opened = true;
      }
    });
  }

  ngAfterViewChecked() {
    this.cdRef.detectChanges();
  }

  getBranchById(id: number) {
    return this.possibleBranches.pipe(
      map(branches => {
        return branches.find(b => b.branchId === id);
      })
    );
  }


  getBudgetById(id: number) {
    return this.possibleBudgets.pipe(
      map(budgets => {
        return budgets.find(b => b.budgetId === id);
      })
    );
  }

  getProjectById(id: number) {
    return this.possibleProjects.pipe(
      map(projects => {
        return projects.find(b => b.projectId === id);
      })
    );
  }

  getActionStatusById(id: number) {
    return this.possibleStatuses.pipe(
      map(statuses => {
        return statuses.find(b => b.invoiceActionStatusId === id);
      })
    );
  }

  save(): boolean {
    return this.invoiceActionContent.save();
  }
}
