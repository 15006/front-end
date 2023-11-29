import { FocusMonitor } from '@angular/cdk/a11y';
import { coerceBooleanProperty } from '@angular/cdk/coercion';
import { Component, DoCheck, ElementRef, OnDestroy, OnInit, Optional, Self, Output, EventEmitter } from '@angular/core';
import { ControlValueAccessor, UntypedFormControl, NgControl, NG_VALUE_ACCESSOR } from '@angular/forms';
import { MatFormFieldControl } from '@angular/material/form-field';
//import { userInfo } from 'os';
import { combineLatest, Observable, Subject, Subscriber, Subscription } from 'rxjs';
import { filter, first, map, startWith, takeUntil } from 'rxjs/operators';
import { Supplier } from 'src/app/core/entities/supplier';
import { MetadataService } from 'src/app/core/services/metadata.service';

@Component({
  selector: 'app-supplier-selector',
  templateUrl: './supplier-selector.component.html',
  styleUrls: ['./supplier-selector.component.scss'],
  providers: [
    {
      provide: MatFormFieldControl,
      useExisting: SupplierSelectorComponent
    }
  ],
  host: {
    '[class.floating]': 'shouldLabelFloat',
    '[id]': 'id',
  }
})
export class SupplierSelectorComponent implements OnInit, OnDestroy, DoCheck, ControlValueAccessor, MatFormFieldControl<number> {

  // FormControl that edits a supplierId field, with value of number | null

  @Output() selectionChange = new EventEmitter<Supplier>();

  private _val: number | null = null;
  private _placeholder: string = '';
  private _required: boolean = false;
  private _disabled: boolean = false;

  static nextId: number = 0;
  id: string = `supplier-selector-${SupplierSelectorComponent.nextId++}`;


  allSuppliers$: Observable<Supplier[]>;
  filteredSuppliers$: Observable<Supplier[]>;

  formControl = new UntypedFormControl(null);

  destroy$ = new Subject<void>();

  touched: boolean = false;
  focused: boolean = false;
  controlType?: string = 'app-supplier-selector';

  stateChanges = new Subject<void>();
  filteredPossibleSuppliers$: Observable<Supplier[]>;
  supplierDisplayFunc = (all: Supplier[]) => (id: string) => {
    console.log(id)
    if (all && id) return all.find(s => s.supplierId === id)?.supplierName;
    return '';
  };

  onTouched: () => void = () => { };

  constructor(
    private metadata: MetadataService,
    private fm: FocusMonitor,
    private elRef: ElementRef,
    @Optional() @Self() public ngControl: NgControl) {

    if (this.ngControl != null) {
      this.ngControl.valueAccessor = this;
    }

    fm.monitor(elRef.nativeElement, true).subscribe((origin) => {
      this.focused = !!origin;
      this.stateChanges.next();
    });
    this.allSuppliers$ = this.metadata.getAllSuppliers();
  }

  ngDoCheck(): void {
    if ((!this.touched) && (this.formControl.touched)) {
      // console.log('TOUCHED!');
      this.touched = true;
      this.onTouched();
    }
  }

  ngOnInit(): void {

    const searchValue$ = this.formControl.valueChanges.pipe(
      startWith(''),
    );

    this.filteredSuppliers$ = combineLatest([this.allSuppliers$, searchValue$]).pipe(
      map(([allSuppliers, searchValue]) => this.filterSuppliers(searchValue, allSuppliers))
    );
  }

  ngOnDestroy(): void {
    this.destroy$.next();

    this.stateChanges.complete();
    this.fm.stopMonitoring(this.elRef.nativeElement);
  }

  private filterSuppliers(value: string | number | null, options: Supplier[]): Supplier[] {
    // console.log('filter suppliers', value, options.length);
    const val = this.formControlValueToString(value);
    const res = options.filter(sup =>
      sup.supplierName.toLowerCase().includes(val)
      || sup.registerNum.toLowerCase().includes(val)
      || sup.supplierId.toString().includes(val))
      .slice(0, 50);

    return res
  }

  private formControlValueToString(value: string | number | null): string {
    if (typeof (value) === 'string') return value.toLowerCase();
    if (typeof (value) === 'number') return value.toString();

    return '';
  }

  displayFn(supplier: Supplier): string {
    return supplier && supplier.supplierName
      ? supplier.supplierName
      : '';
  }


  getControlValue(obj: Supplier): number | null {
    if (!obj) return null;

    if (obj.supplierId) return Number(obj.supplierId);

    return null;
  }

  //#region MatFormFieldControl implementation
  get value(): number {
    return this._val;
  }
  set value(val: number) {
    this.writeValue(val);
  }

  get placeholder(): string { return this._placeholder; }
  set placeholder(val: string) {
    this._placeholder = val;
    this.stateChanges.next();
  }

  get empty() {
    return !this.formControl.value;
  }

  get shouldLabelFloat() {
    return this.focused || !this.empty;
  }

  get required(): boolean {
    return this._required;
  }
  set required(value: boolean) {
    this._required = coerceBooleanProperty(value);
    this.stateChanges.next();
  }

  get disabled(): boolean {
    return this._disabled;
  }
  set disabled(value: boolean) {
    this.setDisabledState(value);
  }

  get errorState(): boolean {
    return this.formControl.invalid && this.touched;
  }

  setDescribedByIds(ids: string[]): void {
  }

  onContainerClick(event: MouseEvent): void {

  }

  //#endregion


  //#region ControlValueAccessor Implementation

  async writeValue(obj: any) {
    // console.log('Supplier Selector Write Value', obj);
    if ((typeof (obj) === 'number') || (obj === null)) {

      if (obj === null) {
        this.formControl.setValue(null);
        this._val = null;
        this.stateChanges.next();
        return;
      }

      const allSuppliers = await this.allSuppliers$.pipe(
        first()
      ).toPromise();

      const selected = allSuppliers.find(sup => sup.supplierId === obj);
      this.formControl.setValue(selected);
      this._val = this.getControlValue(selected);
      this.stateChanges.next();
    }
  }
  emit() {
    this.selectionChange.emit(this.formControl.value);
  }
  registerOnChange(fn: (val: number | null) => void): void {
    // console.log('Supplier Selector register on change', fn);
    this.formControl.valueChanges.pipe(
      filter(val => typeof (val) === 'object'),
      map(val => this.getControlValue(val)),
      takeUntil(this.destroy$)
    ).subscribe(fn)
  }

  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }

  setDisabledState?(isDisabled: boolean): void {
    this._disabled = coerceBooleanProperty(isDisabled);
    this._disabled ? this.formControl.disable() : this.formControl.enable();
    this.stateChanges.next();
  }
  
  valid_numbers(e: any) {
   return this.metadata.valid_numbers(e);
  }
  //#endregion
}
