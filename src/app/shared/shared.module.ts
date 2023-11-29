import { NgModule } from "@angular/core";
import { MAT_DATE_FORMATS } from '@angular/material/core';
import { MatButtonModule } from '@angular/material/button';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatIconModule } from '@angular/material/icon';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatSelectModule } from '@angular/material/select';
import { MatFormFieldModule } from '@angular/material/form-field';
import { FormsModule, ReactiveFormsModule } from "@angular/forms";
import { MatExpansionModule } from '@angular/material/expansion';
import { MatInputModule } from '@angular/material/input';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatTableModule } from '@angular/material/table';
import { MatCardModule } from '@angular/material/card';
import { MatDividerModule } from '@angular/material/divider';
import { MatSortModule } from '@angular/material/sort';
import { SupplierSelectorComponent } from './supplier-selector/supplier-selector.component';
import { CommonModule } from "@angular/common";
import { MatDatepickerModule } from "@angular/material/datepicker";
import { MatMomentDateModule, MAT_MOMENT_DATE_ADAPTER_OPTIONS } from "@angular/material-moment-adapter";
import { MY_DATE_FORMAT } from "./my-date-format";
import { InputPromptDialogComponent } from './ui/input-prompt-dialog/input-prompt-dialog.component';
import { AlertComponent } from './ui/alert/alert.component';
import { ConfirmDialogComponent } from './ui/confirm-dialog/confirm-dialog.component';
import { MatDialogModule, MAT_DIALOG_DEFAULT_OPTIONS } from '@angular/material/dialog';
import { MatTooltipModule } from "@angular/material/tooltip";
import { EmployeeSelectorComponent } from './employee-selector/employee-selector.component';

const importedExportedModules = [
  MatButtonModule,
  MatCheckboxModule,
  MatIconModule,
  MatSidenavModule,
  MatDialogModule,
  MatToolbarModule,
  MatSelectModule,
  FormsModule,
  MatFormFieldModule,
  ReactiveFormsModule,
  MatExpansionModule,
  MatInputModule,
  MatAutocompleteModule,
  MatTableModule,
  MatCardModule,
  MatDividerModule,
  MatExpansionModule,
  MatSortModule,
  MatDatepickerModule,
  MatMomentDateModule,
  MatTooltipModule
];

const declaredPublic = [
  SupplierSelectorComponent,
  AlertComponent,
  InputPromptDialogComponent,
  EmployeeSelectorComponent,
  ConfirmDialogComponent,
]

@NgModule({
  declarations: [
    ...declaredPublic,
  ],
  imports: [
    CommonModule,
    ...importedExportedModules
  ],
  exports: [
    ...importedExportedModules,
    ...declaredPublic
  ],
  providers: [
    { provide: MAT_DATE_FORMATS, useValue: MY_DATE_FORMAT },
    { provide: MAT_MOMENT_DATE_ADAPTER_OPTIONS, useValue: { useUtc: true } },
    { provide: MAT_DIALOG_DEFAULT_OPTIONS, useValue: { hasBackdrop: false } },

  ]
})
export class SharedModule {

}
