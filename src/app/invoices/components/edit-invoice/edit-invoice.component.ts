import {
  Component,
  OnDestroy,
  OnInit,
  ViewChild,
  AfterContentInit,
  HostListener,
} from '@angular/core';
// import { FormArray, FormControl, FormGroup, Validators } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import {
  ActivatedRoute,
  NavigationEnd,
  NavigationStart,
  Router,
} from '@angular/router';
import { InvoiceStateService } from '@app/core/services/invoice-state.service';
import { relativeTimeRounding } from 'moment';
import {
  combineLatest,
  EMPTY,
  merge,
  observable,
  Observable,
  of,
  pairs,
  Subject,
} from 'rxjs';
import {
  filter,
  map,
  mergeAll,
  switchMap,
  takeUntil,
  tap,
  catchError,
  distinctUntilChanged,
  withLatestFrom,
  share,
  mergeMap,
  startWith,
  windowWhen,
} from 'rxjs/operators';
//import {merge,mergeAll,mergeMapTo,mergeScan}from 'rxjs/operators';
import {
  Invoice,
  InvoiceForm,
  InvoiceForUpload,
  InvoiceVm,
} from 'src/app/core/entities/invoice';
import { Order, OrderVm } from 'src/app/core/entities/order';
import { DatesService } from 'src/app/core/services/dates.service';
import { InvoiceService } from 'src/app/core/services/invoice.service';
import { MetadataService } from 'src/app/core/services/metadata.service';
import { OrdersService } from 'src/app/core/services/orders.service';
import { cache } from 'src/app/shared/tools/rxjs-operators/cache';
// import { pathToFileURL } from 'url';
import { UploadDigitalInvoiceComponent } from '../upload-digital-invoice/upload-digital-invoice.component';
import { InvoiceActionsComponent } from './invoice/invoice-actions/invoice-actions.component';
import { InvoiceComponent } from './invoice/invoice.component';
import { UserService } from '@app/core/services/user.service';

@Component({
  selector: 'app-edit-invoice',
  templateUrl: './edit-invoice.component.html',
  styleUrls: ['./edit-invoice.component.scss'],
})
export class EditInvoiceComponent implements OnInit, OnDestroy {
  destroy$ = new Subject<void>();
  cooperativeId$: Observable<number>;
  orderId$: Observable<number>;
  invoiceId$: Observable<number>;
  order$: Observable<OrderVm>;
  invoice$: Observable<InvoiceVm> = new Observable<InvoiceVm>();
  orderInvoice$: Observable<InvoiceVm>;
  loading$: Observable<boolean>;
  allowed$: Observable<boolean>;
  errorStr: string;
  changesLocked: boolean = false;
  invoiceRes$: Observable<any>;

  cacheInvoiceId: number = null;
  cacheOrderId: number = null;
  hasOrderInvoice: boolean = false;
  invoiceId: number;
  isVisible: boolean;
  isReshetUser: boolean;
  isReshest: any;
  user: any;
  constructor(
    private route: ActivatedRoute,
    private orderService: OrdersService,
    private invoiceService: InvoiceService,
    public dialog: MatDialog,
    private router: Router,
    private metaDataService: MetadataService,
    private invoiceState: InvoiceStateService,
    private dateService: DatesService,
    private snackBar: MatSnackBar,
    private userService: UserService
  ) {
    this.loading$ = invoiceState.getLoadingObservable();
    invoiceState.setLoading(true);
  }
  canDeactivate(): Observable<boolean> | Promise<boolean> | boolean {
    //  if (this.metaDataService.addActionFlag) {
    if (this.invoiceService.dirty) {
      if (this.metaDataService.addActionFlag) {
        this.metaDataService.addActionFlag = false;
        return true;
      }
      return false;
    }
    return true;
  }

  @ViewChild(InvoiceComponent) InvoiceComp: InvoiceComponent;
  @ViewChild(InvoiceActionsComponent)
  InvoiceActionsComp: InvoiceActionsComponent;

  ngOnInit(): void {
    // this.router.events.subscribe(event => {
    //   if (event instanceof NavigationEnd) {
    //     if (!event.url.toString().includes('invoices/edit')) {
    //        //alert('**********************')
    //       if (this.invoiceService.dirty) {
    //         debugger
    //         this.invoiceService.dirty = false;
    //         var message = "האם ברצונך לצאת ללא שמירת שינויים?";
    //         var myConfirm = confirm(message)
    //         if (myConfirm) {
    //           return;
    //         }

    //         if (this.invoiceId !== undefined)
    //           this.router.navigate([`/invoices/edit/${this.invoiceId}`]);
    //         else
    //           this.router.navigate([`/invoices/edit`]);
    //       }
    //     }
    //   }

    // })

    this.cooperativeId$ = this.metaDataService.getCooperativeId();
    this.isVisible = true;

    this.orderId$ = this.route.queryParams.pipe(
      //this.route.queryParams.pipe(
      distinctUntilChanged(),
      map((prms) =>
        isNaN(Number(prms['orderId'])) ? null : Number(prms['orderId'])
      )
      // switchMap(oId = > this.invoiceService.GetInvoiceVmByOrder(oId))
    );
    this.invoiceId$ = this.route.params.pipe(
      distinctUntilChanged(),
      map((prms) => (isNaN(Number(prms['id'])) ? null : Number(prms['id'])))
    );
    this.invoiceState.setLoading(true);

    this.invoice$ = combineLatest([this.invoiceId$, this.orderId$]).pipe(
      switchMap(([invoiceId, orderId]) => {
        if (
          this.invoiceRes$ &&
          this.cacheInvoiceId == invoiceId &&
          this.cacheOrderId == orderId
        ) {
          return this.invoiceRes$;
        }
        this.cacheInvoiceId = invoiceId;
        this.cacheOrderId = orderId;
        if (!!invoiceId) {
          this.invoiceRes$ = this.invoiceService
            .GetInvoiceById(invoiceId)
            .pipe(share());
          return this.invoiceRes$;
        } else if (!!orderId) {
          this.invoiceRes$ = this.invoiceService
            .GetInvoiceVmByOrder(orderId)
            .pipe(share());
          return this.invoiceRes$;
        } else if (!invoiceId && !orderId) {
          setTimeout(() => {
            this.invoiceState.loading = false;
            this.invoiceState.setLoading(false);
          }, 0);
        }
        return of({});
      }),
      catchError((err) => {
        console.error(err);
        this.invoiceState.loading = false;
        this.invoiceState.setLoading(false);
        this.errorStr = err.error?.message || err.error || err.message;

        // this.router.navigate(['/invoices/search']);
        return of({});
      })
    );

    this.orderInvoice$ = combineLatest([
      this.invoiceId$,
      this.invoice$,
      this.orderId$,
    ]).pipe(
      filter(
        ([invoiceId, invoice, orderId]) => !!invoiceId && !!invoice && !!orderId
      ),
      distinctUntilChanged(),
      switchMap(([invoiceId, invoice, orderId]) => {
        if (!invoice.invoiceActions?.some((s) => s.orderId === orderId)) {
          this.hasOrderInvoice = true;
          return this.invoiceService.GetInvoiceVmByOrder(orderId);
        }
        return new Observable<InvoiceVm>();
      }),
      catchError((err) => {
        console.error(err);
        let snackBar = this.snackBar.open(`הזמנה לא נמצאה`, 'סגור', {
          duration: 3000,
          panelClass: ['red-snackbar']

        });
        return new Observable<InvoiceVm>();
      })
    );

    this.invoice$.subscribe((s) => {
      this.invoiceState.setValue(s);
      this.invoiceState.setLoading(false);
      if (s.invoiceId > 0 && !this.hasOrderInvoice) {
        this.changesLocked = true;
      }
      this.invoiceState.beforeChange = s;
      this.invoiceId = s.invoiceId;
      this.invoiceState.setSelectedAction(s.invoiceActions[0]);
      this.allowed$ = this.metaDataService.getUser().pipe(
        map((user) => {
          if (user.userId.toString().substring(1, 3) === '50') {
            this.isReshetUser = true;
            return true;
          }
          const selected =
            this.invoiceState.selectedAction ||
            (s.invoiceActions?.length ? s.invoiceActions[0] : null);
          if (!selected || this.invoiceState.invoice?.receiver === user.userId) {
            return true;
          }
          if (
            selected.branchId !== user.branchId ||
            !selected.orderId ||
            selected.invoiceActionStatusId > 75 ||
            this.invoiceState.totalSum === 0
          ) {
            return false;
          }
          return true;
        })
      );
    });

    this.orderInvoice$.subscribe((s) => {
      if (s) {
        this.hasOrderInvoice = true;
        this.changesLocked = false;
        const exist = this.invoiceState.invoice.invoiceActions.find(
          (ss) => ss.orderId === s.invoiceActions[0].orderId
        );
        if (!exist) {
          s.invoiceActions[0].invoiceId = this.invoiceState.invoice?.invoiceId;
          let newL = this.invoiceState.invoice.invoiceActions.push(
            s.invoiceActions[0]
          );
          this.invoiceState.setValue(this.invoiceState.invoice);
          this.invoiceState.setSelectedAction(
            this.invoiceState.invoice.invoiceActions[newL - 1]
          );
        } else {
          this.invoiceState.setSelectedAction(exist);
        }
      }
    });

    this.invoiceState.getSelectedActionObservable().subscribe((s) => {
      if  (!!s?.orderId){
        debugger;
        this.orderService.getOrderTotalSum(s.orderId).subscribe((total) => {
          this.invoiceState.totalSum = total;
        });
      }
    });
  }

  // beforeUnloadHandler() {
  //   var message = 'Are you sure you want to leave?';
  //   return message;
  // }

  openUploadDigitalDialog() {
    const dialogRef = this.dialog.open(UploadDigitalInvoiceComponent, {
      width: '600px',
      data: { invoice: this.invoiceState.invoice.invoiceId },
      hasBackdrop: true,
    });

    dialogRef.afterClosed().pipe(
      filter((r) => r !== null),
      takeUntil(this.destroy$)
    );
  }
  @HostListener('window:beforeunload')
  onBeforeUnload(): boolean {
    // if (this.invoiceService.retrieveOrderFlag) {
    //   this.invoiceService.retrieveOrderFlag = false;
    // }
    // else {
    //   console.log('return');
    if (this.invoiceService.dirty)
      // if(!this.invoiceService.retrieveOrderFlag)
      return false;
  }
  // }
  async changeLocking(status: number) {
    this.user = await this.metaDataService.getUserPromise();
    if (status > 79 && !this.userService.isNetworkAdmin(this.user)) return;
    this.changesLocked = false;
    this.invoiceService.dirty = true;
    this.InvoiceComp.form.markAsTouched();
  }

  backToInvoices() {
    this.allowed$.pipe(map((a) => !a.valueOf()));
    this.router.navigate(['/invoices/search']);
  }
  get actionSum() {
    return this.invoiceState.actionSum;
  }

  get invoiceTotalSum() {
    return (
      this.invoiceState.invoice.invoiceActions?.reduce(
        (a, b) =>
          a + b?.items?.reduce((c, d) => c + d.quantity * d.unitPrice, 0),
        0
      ) || 0
    );
  }

  private fixInvoiceVm(original: InvoiceVm): InvoiceVm {
    let res = { ...original };
    if (res.invoiceActions === null) {
      res.invoiceActions = [];
    }

    res.createdDate = this.dateService.dateTimeToDate(original.createdDate);
    res.receptionDate = this.dateService.dateTimeToDate(original.receptionDate);
    res.matchId = original.matchId;

    return res;
  }

  save() {
    this.invoiceService.dirty = false;
    if (this.InvoiceActionsComp.save() && this.InvoiceComp.save()) {
      this.invoiceState.setLoading(true);
      try {
        const action = { ...this.invoiceState.selectedAction };
        action.items = [...action.items].filter(
          (f) => f.unitPrice && f.quantity
        );
        // Fill null itemIDs
        this.invoiceService
          .SaveInvoice({
            ...this.invoiceState.invoice,
            invoiceActions: [this.invoiceState.selectedAction],
          })
          .subscribe(
            (res) => {
              this.invoiceState.setLoading(false);
              let snackBar = this.snackBar.open(
                'חשבונית נשמרה בהצלחה.',
                'סגור',
                {
                  duration: 3000,
                  panelClass: ['green-snackbar']

                }
              );
              this.invoiceState.actionSum = 0;
              if (!this.invoiceState.invoice.invoiceId) {
                this.router
                  .navigateByUrl('/', { skipLocationChange: true })
                  .then(() => {
                    this.router.navigateByUrl(
                      `/invoices/edit/${res.invoiceId}`,
                      { skipLocationChange: true }
                    );
                  });
              } else {
                const io = this.invoiceState.invoice.invoiceActions.indexOf(
                  this.invoiceState.selectedAction
                );
                this.invoiceState.setValue(res);
                this.invoiceState.setSelectedAction(
                  this.invoiceState.invoice.invoiceActions[io]
                );
              }
            },
            (err) => {
              console.error(err);
              this.invoiceState.setLoading(false);
              let snackBar = this.snackBar.open(
                'שגיאה! חשבונית לא נשמרה!',
                'סגור',
                {
                  duration: 3000,
                  panelClass: ['red-snackbar']

                },

              );
            }
          );
      } catch (err) { }
    } else {
      let snackBar = this.snackBar.open(
        'טופס לא תקין, נא בדקו שדות שגויים.',
        'סגור',
        {
          duration: 3000,
          panelClass: ['red-snackbar']

        }
      );
    }
  }
  print(invoiceId: string) {
    this.router.navigateByUrl(`/invoices/print/${invoiceId}`, {
      skipLocationChange: true,
    });

    // this.router.navigate(['/invoices/print', invoiceId]);
  }

  onNoClick(): void {
    this.invoiceService.dirty = true;
    this.isVisible = false;
  }

  valid_numbers(e: any) {
    return this.metaDataService.valid_numbers(e);
  }

  ngOnDestroy() {
    //this.destroy$.next();
    //   debugger
    //   var message = "האם ברצונך לצאת ללא שמירת שינויים?";
    //   var myConfirm = confirm(message);
    //   if (myConfirm) {
    //     return;
    //   }
    //   if (this.invoiceId !== undefined)
    //     this.router.navigate([`/invoices/edit/${this.invoiceId}`]);
    //   else
    //     this.router.navigate([`/invoices/edit`]);
  }
}
