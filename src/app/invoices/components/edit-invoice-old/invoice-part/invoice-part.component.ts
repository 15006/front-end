import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { UntypedFormGroup, UntypedFormControl, Validators, UntypedFormArray } from '@angular/forms';
// import { Form, UntypedFormArray, UntypedFormControl, UntypedFormGroup, Validators } from '@angular/forms';
import { type } from 'os';
import { BehaviorSubject, combineLatest, Observable, pairs, Subject } from 'rxjs';
import { distinct, filter, map, switchMap, takeUntil, tap } from 'rxjs/operators';
import { Invoice, InvoiceActionForm, InvoiceForm, InvoiceVm, InvoiceForPrint } from 'src/app/core/entities/invoice';
import { MetadataService } from 'src/app/core/services/metadata.service';

type NewType = Subject<void>;

@Component({
  selector: 'app-invoice-part',
  templateUrl: './invoice-part.component.html',
  styleUrls: ['./invoice-part.component.scss']
})
export class InvoicePartComponent implements OnInit, OnDestroy {

  @Input()
  set invoiceVm$(val: Observable<InvoiceVm>) {
    console.log(val);

    this.myInvoiceVm$ = val;
  }

  // form: FormGroup;
  destroy$ = new Subject<void>();
  form: UntypedFormGroup;
  myInvoiceVm$: Observable<InvoiceVm>;

  selectedInvoiceActionIndex$ = new BehaviorSubject(0);

  invoiceForm$: Observable<InvoiceForm>;

  constructor(private metaDataService: MetadataService) {

  }


  control(name: keyof Invoice): UntypedFormControl {
    return this.form.get(name) as UntypedFormControl;
  }

  ngOnInit(): void {



    this.initForm();

    this.myInvoiceVm$.pipe(
      takeUntil(this.destroy$)).subscribe
      (i => {
        this.matchToInvoiceForm(i);
        this.buildInvoiceActionsGroup(i.invoiceActions.length);
        this.form.reset(i);
      });
  }


  private matchToInvoiceForm(inv: InvoiceVm): InvoiceForm {
    console.log(inv);

    let res: InvoiceForm = {
      invoiceId: inv.invoiceId,
      invoiceNumber: inv.invoiceNumber,
      createDate: inv.createdDate,
      supplierId: inv.supplierId,
      receptionDate: inv.receptionDate,
      invoiceDescription: inv.description,
      invoiceNote: inv.notes,
      createdByEmployeeId: inv.createdByEmployeeId,
      matchId: inv.matchId,
      invoiceActions: []
      // isTaxInvoice
      // filePath
      // fileName

    };
    return res;
  }

  private initForm() {
    this.form = new UntypedFormGroup({
      //createdDate: new FormControl(dTomorrow.toISOString(),[Validators.required]),
      createdDate: new UntypedFormControl(null, [Validators.required]),
      invoiceNumber: new UntypedFormControl(null, [Validators.required, Validators.pattern('^[0-9]{6}$')]),
      supplierId: new UntypedFormControl(null, Validators.required),
      //receptionDate:new FormControl(dToday.toISOString(),Validators.required),
      receptionDate: new UntypedFormControl(null, Validators.required),
      invoiceDescription: new UntypedFormControl(null, Validators.required),
      invoiceNote: new UntypedFormControl(null),
      invoiceActions: new UntypedFormArray([])
    });
  }


  addInvoiceActionGroup(): UntypedFormGroup {
    const group = new UntypedFormGroup({
      branchId: new UntypedFormControl(null, Validators.required),
      budgetId: new UntypedFormControl(null, Validators.required),
      projectId: new UntypedFormControl(null, Validators.required),
      valueDate: new UntypedFormControl(null, [Validators.required/*,DateValidators.minimumDate(()=> this.minDateByRoll.toISOString())*/]),
      invoiceActionStatusId: new UntypedFormControl(-1/*בחירת מערכת*/, Validators.required),
      invoiceActionDescription: new UntypedFormControl(null, Validators.required),
      orderId: new UntypedFormControl(null, Validators.required),
      //orderDate: new FormControl(null,Validators.required),
    });

    this.getInvoiceActionFromArray().push(group);

    return group;
  }

  buildInvoiceActionsGroup(count: number) {
    // if there are not enough, build more
    const array = this.getInvoiceActionFromArray();
    while (array.length < count)
      this.addInvoiceActionGroup();

    /*while (array.length > count) {
      this.deleteOrderDetailGroup(array.length - 1);
    }*/
  }


  ngOnDestroy(): void {
    this.destroy$.next();
  }
  valid_numbers(e: any) {
    return this.metaDataService.valid_numbers(e);
  }
  getInvoiceActionFromArray(): UntypedFormArray {
    console.log('invoiceActions i', this.control('invoiceActions'), this.control('createdDate'));
    return this.control('invoiceActions') as unknown as UntypedFormArray;
    // return this.form.controls.invocieActions['controls'] as unknown as FormArray;//.control as undefined as FormControl;
    //{{invoiceForm.controls['items'].controls[i].controls.itemName.value | json}}
  }


  getSelectedInvoiceActionFrom(i: number/*val: keyof Invoice*/): UntypedFormGroup {//debugger
    console.log('invoiceActions i', this.control('invoiceActions'), i);
    i = 0;
    return (this.control('invoiceActions') as unknown as UntypedFormArray).controls[i] as unknown as UntypedFormGroup;

  }

}
/*
function foreach(arg0: action) {
  throw new Error('Function not implemented.');
}
*/
