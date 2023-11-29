import { Component, EventEmitter, Input, OnInit, Output, HostListener } from '@angular/core';
// import { UntypedFormArray, UntypedFormControl, UntypedFormGroup, Validators, ValidatorFn } from '@angular/forms';
import { InvoiceStateService } from '@app/core/services/invoice-state.service';
import { Invoice, InvoiceActionVm, InvoiceVm } from 'src/app/core/entities/invoice';
import { combineLatest, Observable, Subject } from 'rxjs';
import { takeUntil, filter, map, timeout, debounceTime } from 'rxjs/operators';
import { InvoiceService } from '@app/core/services/invoice.service';
import { ActivatedRoute, Router } from '@angular/router';
import { FORMERR } from 'dns';
import * as moment from 'moment';
import { MatDialog } from '@angular/material/dialog';
// import { UploadDigitalInvoiceComponent } from '../../upload-digital-invoice/upload-digital-invoice.component';
import { UserService } from '@app/core/services/user.service';
import { MetadataService } from '@app/core/services/metadata.service';
import { User } from '@app/core/entities/user';
import { UntypedFormGroup, UntypedFormControl, Validators } from '@angular/forms';
import { json } from 'stream/consumers';
import { stringify } from 'querystring';

const invoiceDateCheck = new Date(2010, 12, 32);


@Component({
  selector: 'app-invoice',
  templateUrl: './invoice.component.html',
  styleUrls: ['./invoice.component.scss']
})
export class InvoiceComponent implements OnInit {
  destroy$ = new Subject<void>();
  user: User;
  form: UntypedFormGroup;
  duplicateInvoice: InvoiceVm = null;
  invoice$: Observable<InvoiceVm>;
  userId$: Observable<User>;
  invoice: any;
  userId: number;
  isReshetUserVar: boolean;
  constructor(private invoiceState: InvoiceStateService,
    private router: Router,
    public dialog: MatDialog,
    private userService: UserService,
    public metaDataService: MetadataService,
    public invoiceService: InvoiceService,
    private route: ActivatedRoute) {


  }


  control(name: keyof InvoiceVm): UntypedFormControl {
    return this.form.get(name) as UntypedFormControl;
  }
  get selected() {
    return this.invoiceState.selectedAction;
  }

  private navigateToInvoice(id: number) {
    window.open(`${document.baseURI}/invoices/edit/${id}`, '_blank');
  }

  private async initForm() {
    const result = this.metaDataService.getUserPromise()//.pipe(debounceTime(2000)).subscribe(value => this.user = value);
    // console.log((await result).userId);
    this.userService.myUser = (await result)//}

    const invoice = this.invoiceState.invoice;
    this.form = new UntypedFormGroup({
      createdDate: new UntypedFormControl(invoice.createdDate || moment(new Date()).add(7, 'days').toDate(), [Validators.required]),
      invoiceNumber: new UntypedFormControl(invoice.invoiceNumber, [Validators.required, Validators.pattern('^[0-9]{6}$')]),
      supplierId: new UntypedFormControl(invoice.supplierId, [Validators.required, Validators.min(1)]),
      receiver: new UntypedFormControl( invoice.receiver || this.userService.myUser.userId ),
      notes: new UntypedFormControl(invoice.notes),
      matchId: new UntypedFormControl(invoice.matchId),
      receptionDate: new UntypedFormControl(invoice.receptionDate || moment(new Date()).toDate(), Validators.required),
      description: new UntypedFormControl(invoice.description, Validators.required),
    }, {
      validators: [
        (form: UntypedFormGroup) => {
          if (form.get('createdDate').value <= invoiceDateCheck) {
            if (form.get('invoiceNumber').value?.length !== 5) {
              return {
                'invoiceNumber': 'נא להזין חשבונית בעלת 5 ספרות'
              }
            } else {
              if (form.get('invoiceNumber').value?.length !== 6) {
                return {
                  'invoiceNumber': 'נא להזין חשבונית בעלת 6 ספרות'
                }
              }
            }
          }
          return null;
        },
        (form: UntypedFormGroup) => {
          if (form.get('supplierId').value === 499999 || form.get('supplierId').value == 499998) {
            return {
              'invoiceNumber': 'לא ניתן להזין לחשבונית ספק כללי או ספק להצעת מחיר'
            }
          }
          return null;
        }
      ]
    });
    if (this.form) {

      this.form.valueChanges.subscribe((value) => {
        if (this.form.touched)
          this.invoiceService.dirty = true;

        if (!invoice.invoiceId && this.form)
          this.invoiceService.dirty = true;

      });
    }
  }


  ngOnInit(): void {

    this.initForm();
    this.invoice$ = this.invoiceState.getObservable();
    this.invoice$.subscribe(this.loadInvoice);
    this.loadInvoice(this.invoiceState.invoice);
  }

  loadInvoice(s: InvoiceVm) {
    if (!!this.invoiceState && !this.invoiceState?.selectedAction && !!s?.invoiceActions?.length) {
      this.invoiceState.setSelectedAction(s?.invoiceActions ? s?.invoiceActions[0] : null);
    }
    if (s && !!this.form) {
      this.form.reset({
        createdDate: s.createdDate || moment(new Date()).add(7, 'days').toDate(),
        invoiceNumber: s.invoiceNumber,
        supplierId: s.supplierId,
        receptionDate: s.receptionDate || moment(new Date()).toDate(),
        description: s.description,
        notes: s.notes,
        matchId: s.matchId,
        receiver: s.receiver || this.userService.myUser.userId
      });


      this.form.markAsPristine();
    }
  }

  checkDuplicateInvoiceAction() {
    this.invoiceState.setLoading(true);
    this.invoiceService.existInvoiceBySupplierAndInvoicveNo(this.form.value.supplierId, this.form.value.invoiceNumber).subscribe(res => {
      if (!res) {
        this.duplicateInvoice = null;
      }
      else if (this.invoiceState.invoice.invoiceId != res?.invoiceId) {
        this.duplicateInvoice = res;
      }
      this.invoiceState.setLoading(false);
    });
  }

  save(): boolean {
    this.form.markAsDirty();
    this.form.markAsTouched();
    this.form.markAllAsTouched();
    if (this.form.valid && (!this.duplicateInvoice || this.metaDataService.isReshetUser)) {
      this.invoiceState.invoice = { ...this.invoiceState.invoice, ...this.form.value };
      this.invoiceState.setValue(this.invoiceState.invoice);
      return true;
    }
    return false;
  }

  get errorArray() {
    return this.form?.errors ? Object.keys(this.form.errors).map(key => this.form.errors[key]) : [];
  }
  valid_numbers(e: any) {
    return this.metaDataService.valid_numbers(e);
   }
  // canDeactivate(): Observable<boolean> | boolean {
  //   return !this.form.dirty && !this;
  // }
  // @HostListener('window:beforeunload', ['$event'])
  // unloadNotification($event: any) {
  //   if (!this.canDeactivate()) {
  //     $event.returnValue = "";
  //   }
  // }
}
