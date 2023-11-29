import { Component, OnInit, Inject } from '@angular/core';
import { FormBuilder, FormGroup, UntypedFormControl } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';

export interface DialogData {
  input: UntypedFormControl;
  title: string;
  message: string;
  label: string;
  confirmText: string;
  cancelText: string;
  html:string;
  errors: {
    pattern: string;
    required: string;
  }
}

@Component({
  selector: 'app-input-prompt-dialog',
  templateUrl: './input-prompt-dialog.component.html',
  styleUrls: ['./input-prompt-dialog.component.scss']
})
export class InputPromptDialogComponent implements OnInit {

  form: FormGroup;

  constructor(
    private formBuilder: FormBuilder,
    public dialogRef: MatDialogRef<InputPromptDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: DialogData,
  ) {
    dialogRef.disableClose = true;
  }

  input: string;

  onNoClick(): void {
    this.dialogRef.close(null);


  }

  onSave() {
    if (this.form.valid) {
      this.dialogRef.close(this.form.value);
    } else {
      this.form.markAsDirty();
    }
  }

  ngOnInit(): void {
    this.form = this.formBuilder.group({
      input: this.data.input
    });
  }


}
