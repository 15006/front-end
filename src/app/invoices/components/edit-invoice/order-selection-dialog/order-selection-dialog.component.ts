import { Component, OnInit, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';

export interface DialogData {
  title: string;
  message: string;
  confirmText: string;
  cancelText: string;
}

@Component({
  selector: 'app-order-selection-dialog',
  templateUrl: './order-selection-dialog.component.html',
  styleUrls: ['./order-selection-dialog.component.scss']
})
export class OrderSelectionDialogComponent implements OnInit {

  constructor(
    public dialogRef: MatDialogRef<OrderSelectionDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: DialogData,
  ) {
    dialogRef.disableClose = true;
  }

  onNoClick(): void {
    this.dialogRef.close(false);
  }

  ngOnInit(): void {
  }

}
