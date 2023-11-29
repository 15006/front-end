import { Injectable } from '@angular/core';
import { InvoiceForUpload, TaxInvoiceOption } from 'src/app/core/entities/invoice';
import {InvoiceService} from 'src/app/core/services/invoice.service';
import {map, switchMap, tap} from 'rxjs/operators';
import { TaxInvoiceOptionMark } from './tax-invoice-option-mark';
import { combineLatest ,from, Observable} from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class TaxInvoiceOptionService {
  

  constructor(
    private invoiceService : InvoiceService
  ) { }

  //getCheckTaxInvoiceOptionId(inv : Invoice):number{
    //   if((inv !== null)&&(inv !== undefined)){
    //     return inv.isTaxInvoice;
    //   }
    // }

     //  const checkTaxInvoiceOptionId$ = this.invoice$.pipe(
    //   //distinctUntilChanged(),
    //   filter(inv => (inv !== null)),
    //   map(inv => this.getCheckTaxInvoiceOptionId(inv)),
    // // tap(val=> this.checkTaxInvoiceOptionId=val),
    //   takeUntil(this.destroy$)
    //    ).subscribe(val => val);

    // this.taxInvoiceOptions$ = this.cooperativeId$.pipe(
    //   tap(val => console.log('taxInoiveOprion go to server for fill')),
    //   switchMap(cooperativeId => this.invoiceService.GetTaxInvoiceOptions(cooperativeId)),
    //   tap(val => console.log('taxInoiveOprionList ', val)),
    // );

  GetTaxInvoiveOptionWithTheChackItemMarked(invoice: InvoiceForUpload,cooperativeId: number):Observable< TaxInvoiceOptionMark[]> {
    let taxInvoiceOption$ =  this.invoiceService.GetTaxInvoiceOptions(cooperativeId);
    
    let taxInvoiceOptionMark =  taxInvoiceOption$.pipe(
      map((tax)=> tax.map(t=> this.taxInvoiceAddChackItemMarked(t,invoice)))
    );
    
    return taxInvoiceOptionMark;
}


taxInvoiceAddChackItemMarked(taxInvoiceOptionItem:TaxInvoiceOption ,invoice: InvoiceForUpload): TaxInvoiceOptionMark {
   return {
            ... taxInvoiceOptionItem,
            isChacked:  (invoice.isTaxInvoice === taxInvoiceOptionItem.taxInvoiceOptionId)
            

    };
}

}
