import { Component, OnInit, Output, Input, EventEmitter } from '@angular/core';
import { UntypedFormGroup } from '@angular/forms';

@Component({
  selector: 'app-invoice-item-row',
  templateUrl: './invoice-item-row.component.html',
  styleUrls: ['./invoice-item-row.component.scss']
})
export class InvoiceItemRowComponent implements OnInit {

  localGroup: UntypedFormGroup;
  localIndex: number;

  @Input()
  set group(value: UntypedFormGroup){
    this.localGroup = value;
    console.log('group = ', this.localGroup, 'index = ',this.localIndex);
  }

  @Input()
  set index(value: number){
    this.localIndex = value;
    console.log('group = ', this.localGroup, 'index = ', this.localIndex)
  }

  @Output()
  deleteRow = new EventEmitter<void>();

  constructor() { }

  ngOnInit(): void {
  }

  onDeleteRow(){
      this.deleteRow.emit();
  }
}
