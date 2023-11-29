import { NgModule, LOCALE_ID, DEFAULT_CURRENCY_CODE } from '@angular/core';
import { CommonModule, registerLocaleData } from '@angular/common';
import localeHe from '@angular/common/locales/he';
import { InvoicesRoutingModule } from './invoices-routing.module';
import { InvoicesComponent } from './invoices.component';
import { SearchInvoiceComponent } from './components/search-invoice/search-invoice.component';
import { UploadDigitalInvoiceComponent } from './components/upload-digital-invoice/upload-digital-invoice.component';
import { PrintInvoiceComponent } from './components/print-invoice/print-invoice.component';
import { DownloadInvoicesPackageComponent } from './components/download-invoices-package/download-invoices-package.component';
import { SharedModule } from '../shared/shared.module';
import { SearchInvoiceResultsComponent } from './components/search-invoice/search-results/search-invoice-results.component';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatDialogModule, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { MatGridListModule } from '@angular/material/grid-list';
import { MatRadioModule } from '@angular/material/radio';
import { MatChipsModule, MAT_CHIPS_DEFAULT_OPTIONS } from '@angular/material/chips';
import { EditInvoiceComponent } from './components/edit-invoice/edit-invoice.component';
import { InvoicePartComponent } from './components/edit-invoice-old/invoice-part/invoice-part.component';
import { InvoiceActionPartComponent } from './components/edit-invoice-old/invoice-part/invoice-action-part/invoice-action-part.component';
import { InvoiceItemPartComponent } from './components/edit-invoice/invoice-item-part/invoice-item-part.component';
import { NavInvoiceComponent } from './components/nav-invoice/nav-invoice.component';
import { InvoiceItemsPartComponent } from './components/edit-invoice/invoice-items-part/invoice-items-part.component';
import { InvoiceItemRowComponent } from './components/edit-invoice/invoice-items-part/invoice-item-row/invoice-item-row.component';
import { EditInvoiceOldComponent } from './components/edit-invoice-old/edit-invoice-old.component';
import { InvoiceComponent } from './components/edit-invoice/invoice/invoice.component';
import { InvoiceActionsComponent } from './components/edit-invoice/invoice/invoice-actions/invoice-actions.component';
import { InvoiceActionContentComponent } from './components/edit-invoice/invoice/invoice-action-content/invoice-action-content.component';
import { InvoiceActionItemsComponent } from './components/edit-invoice/invoice/invoice-action-items/invoice-action-items.component';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { PrintCenteralizedInvoiceComponent } from './print-centeralized-invoice/print-centeralized-invoice.component';

//import { NisuyComponent } from './nav-invoice/nisuy/nisuy.component';
registerLocaleData(localeHe);
@NgModule({
  declarations: [
    InvoicesComponent,
    SearchInvoiceComponent,
    UploadDigitalInvoiceComponent,
    PrintInvoiceComponent,
    DownloadInvoicesPackageComponent,
    SearchInvoiceResultsComponent,
    UploadDigitalInvoiceComponent,
    EditInvoiceComponent,
    InvoicePartComponent,
    InvoiceActionPartComponent,
    InvoiceItemPartComponent,
    NavInvoiceComponent,
    InvoiceItemsPartComponent,
    InvoiceItemRowComponent,
    EditInvoiceOldComponent,
    InvoiceComponent,
    InvoiceActionsComponent,
    InvoiceActionContentComponent,
    InvoiceActionItemsComponent,
    PrintCenteralizedInvoiceComponent,
    //NisuyComponent
  ],
  imports: [
    CommonModule,
    InvoicesRoutingModule,
    SharedModule,
    MatFormFieldModule,
    MatDialogModule,
    MatGridListModule,
    MatRadioModule,
    MatChipsModule,
    MatSnackBarModule,
    MatProgressBarModule,
    MatSlideToggleModule,
    ReactiveFormsModule,
    FormsModule,
   MatCheckboxModule,
   MatGridListModule
  ],
  providers: [
    {
      provide: LOCALE_ID,
      useValue: 'he-IL' // 'de-DE' for Germany, 'fr-FR' for France ...
    }, {
      provide: DEFAULT_CURRENCY_CODE,
      useValue: 'ILS'
    }, {
      provide: MatDialogRef,
      useValue: {}
    },
    {
      provide: MAT_DIALOG_DATA, useValue: {}
    }
  ]
})
export class InvoicesModule { }
