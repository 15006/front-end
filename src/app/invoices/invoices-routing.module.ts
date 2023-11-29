import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { SearchResultsComponent } from '../orders/components/search-order/search-results/search-results.component';
import { DownloadInvoicesPackageComponent } from './components/download-invoices-package/download-invoices-package.component';
import { EditInvoiceComponent } from './components/edit-invoice/edit-invoice.component';
import { EditInvoiceOldComponent } from './components/edit-invoice-old/edit-invoice-old.component';
import { PrintInvoiceComponent } from './components/print-invoice/print-invoice.component';
import { SearchInvoiceComponent } from './components/search-invoice/search-invoice.component';
import { UploadDigitalInvoiceComponent } from './components/upload-digital-invoice/upload-digital-invoice.component';
import { InvoicesComponent } from './invoices.component';
import { UnsavedChangesGuard } from '@app/shared/deactivate-guard/unsaved-changes.guard';
import { PrintCenteralizedInvoiceComponent } from './print-centeralized-invoice/print-centeralized-invoice.component';
// import { PrintCeneralizedInvoiceComponent } from './print-ceneralized-invoice/print-ceneralized-invoice.component';

const routes: Routes = [
  {
    path: '', component: InvoicesComponent, children: [
      { path: 'search', component: SearchInvoiceComponent },
      { path: 'print/:invoiceId', component: PrintInvoiceComponent },
      { path: 'upload-digital/:invoiceId', component: UploadDigitalInvoiceComponent },
      { path: 'download-package', component: DownloadInvoicesPackageComponent },
      { path: 'edit/:id', component: EditInvoiceComponent, canDeactivate: [UnsavedChangesGuard] },
      { path: 'edit', component: EditInvoiceComponent, canDeactivate: [UnsavedChangesGuard] },
      { path: 'printCenteralizedInvoice/:listOfInvoices', component: PrintCenteralizedInvoiceComponent },
               
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class InvoicesRoutingModule { }
