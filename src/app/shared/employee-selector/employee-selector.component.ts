import { FocusMonitor } from '@angular/cdk/a11y';
import { coerceBooleanProperty } from '@angular/cdk/coercion';
import { Component, DoCheck, ElementRef, OnDestroy, OnInit, Optional, Self, Output, EventEmitter } from '@angular/core';
import { ControlValueAccessor, UntypedFormControl, NgControl, NG_VALUE_ACCESSOR } from '@angular/forms';
import { MatFormFieldControl } from '@angular/material/form-field';
import { userInfo } from 'os';
import { combineLatest, Observable, Subject, Subscriber, Subscription } from 'rxjs';
import { filter, first, map, startWith, takeUntil } from 'rxjs/operators';
import { User } from 'src/app/core/entities/user';
import { MetadataService } from 'src/app/core/services/metadata.service';

@Component({
  selector: 'app-employee-selector',
  templateUrl: './employee-selector.component.html',
  styleUrls: ['./employee-selector.component.scss'],
  providers: [
    {
      provide: MatFormFieldControl,
      useExisting: EmployeeSelectorComponent
    }
  ],
  host: {
    '[class.floating]': 'shouldLabelFloat',
    '[id]': 'id',
  }
})
export class EmployeeSelectorComponent implements OnInit, OnDestroy, DoCheck, ControlValueAccessor, MatFormFieldControl<number> {

  // FormControl that edits a userId field, with value of number | null

  @Output() selectionChange = new EventEmitter<User>();

  private _val: number | null = null;
  private _placeholder: string = '';
  private _required: boolean = false;
  private _disabled: boolean = false;

  static nextId: number = 0;
  id: string = `employee-selector-${EmployeeSelectorComponent.nextId++}`;


  allUsers$: Observable<User[]>;
  filteredUsers$: Observable<User[]>;

  formControl = new UntypedFormControl(null);

  destroy$ = new Subject<void>();

  touched: boolean = false;
  focused: boolean = false;
  controlType?: string = 'app-employee-selector';

  stateChanges = new Subject<void>();


  onTouched: () => void = () => { };

  constructor(
    public metadata: MetadataService,
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
    this.allUsers$ = this.metadata.getAllUsers();
  }

  ngDoCheck(): void {
    if ((!this.touched) && (this.formControl.touched)) {
      this.touched = true;
      this.onTouched();
    }
  }

  ngOnInit(): void {
    const searchValue$ = this.formControl.valueChanges.pipe(
      startWith(''),
    );

    this.filteredUsers$ = combineLatest([this.allUsers$, searchValue$]).pipe(
      map(([allUsers, searchValue]) => this.filterUsers(searchValue, allUsers))
    );

  }

  ngOnDestroy(): void {
    this.destroy$.next();

    this.stateChanges.complete();
    this.fm.stopMonitoring(this.elRef.nativeElement);
  }

  private filterUsers(value: string | number | null, options: User[]): User[] {
    const val = this.formControlValueToString(value);
    const res = options.filter(sup =>
      sup.firstName.toLowerCase().includes(val)
      || sup.lastName.toLowerCase().includes(val)
      || sup.userId.toString().includes(val))
      .slice(0, 50);

    return res
  }

  private formControlValueToString(value: string | number | null): string {
    if (typeof (value) === 'string') return value.toLowerCase();
    if (typeof (value) === 'number') return value.toString();

    return '';
  }

  displayFn(user: User): string {
    return user && user.firstName
      ? `${user.firstName} ${user.lastName} (${user.userId})`
      : '';
  }


  getControlValue(obj: User): number | null {
    if (!obj) return null;

    if (obj.userId) return Number(obj.userId);

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
    if ((typeof (obj) === 'number') || (obj === null)) {

      if (obj === null) {
        this.formControl.setValue(null);
        this._val = null;
        this.stateChanges.next();
        return;
      }

      const allUsers = await this.allUsers$.pipe(
        first()
      ).toPromise();


      const selected = allUsers.find(sup => sup.userId === obj);
      this.formControl.setValue(selected);
      this._val = this.getControlValue(selected);
      this.stateChanges.next();
    }
  }
  emit() {
    this.selectionChange.emit(this.formControl.value);
  }
  registerOnChange(fn: (val: number | null) => void): void {
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

  //#endregion

}
