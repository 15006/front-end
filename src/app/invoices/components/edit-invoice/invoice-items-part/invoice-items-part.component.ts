import { Component, Input, OnInit, Output, EventEmitter } from '@angular/core';
import { UntypedFormArray } from '@angular/forms';

@Component({
  selector: 'app-invoice-items-part',
  templateUrl: './invoice-items-part.component.html',
  styleUrls: ['./invoice-items-part.component.scss']
})
export class InvoiceItemsPartComponent implements OnInit {

  localFormArray: UntypedFormArray;

  @Input()
  set formArray(value: UntypedFormArray){
    this.localFormArray = value;
  }

  @Output()
  addRow = new EventEmitter<void>();

  constructor() { }

  ngOnInit(): void {
  }

  deleteRow(i: number){
    this.localFormArray?.removeAt(i)
  }

  onAddRow(){
    this.addRow.emit();
  }

}
