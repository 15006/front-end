import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormArray, FormControl, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { relativeTimeRounding } from 'moment';
import { combineLatest, merge, Observable, pairs, Subject } from 'rxjs';
import { filter, map, mergeAll, switchMap, takeUntil, tap } from 'rxjs/operators';
//import {merge,mergeAll,mergeMapTo,mergeScan}from 'rxjs/operators';
import { Invoice, InvoiceForm, InvoiceForUpload, InvoiceVm } from 'src/app/core/entities/invoice';
import { Order, OrderVm } from 'src/app/core/entities/order';
import { DatesService } from 'src/app/core/services/dates.service';
import { InvoiceService } from 'src/app/core/services/invoice.service';
import { MetadataService } from 'src/app/core/services/metadata.service';
import { OrdersService } from 'src/app/core/services/orders.service';
import { pathToFileURL } from 'url';

@Component({
  selector: 'app-edit-invoice-old',
  templateUrl: './edit-invoice-old.component.html',
  styleUrls: ['./edit-invoice-old.component.scss']
})
export class EditInvoiceOldComponent implements OnInit {

  constructor(private route:ActivatedRoute,
    private orderService:OrdersService,
    private invoiceService:InvoiceService,
    private metaDataService:MetadataService,
    private dateService:DatesService) { }
  
  

  cooperativeId$:Observable<number>;
  orderId$ :Observable<number>;
  invoiceId$ :Observable<number>;

  newInvoiceVmByOrder$:Observable<InvoiceVm>;
  newInvoiceVmDefault$:Observable<InvoiceVm>;
  invoiceVmForEdit$:Observable<InvoiceVm>;

  mergeInvoiceVm$:Observable<InvoiceVm>;
  
  // order$:Observable<OrderVm>;

  //destroy$ = new Subject<void>();
  
  ngOnInit(): void {

    this.cooperativeId$ = this.metaDataService.getCooperativeId();
    
   

    this.orderId$ = this.route.params.pipe(//this.route.queryParams.pipe(
      map(prms => Number(prms['orderId'])),
     // switchMap(oId = > this.invoiceService.GetInvoiceVmByOrder(oId))
    );

    this.invoiceId$ = this.route.params.pipe(
      map(prms => Number(prms['invoiceId'])),
    );

    this.newInvoiceVmByOrder$ = combineLatest([this.invoiceId$,this.orderId$]).pipe(
      map(pair=>{return{invoiceId:pair[0],orderId:pair[1]}}),
      filter(pair=>(pair.invoiceId === null) || (Number.isNaN( pair.invoiceId ))),
      filter(pair=>pair.orderId !== null),
      switchMap(pair => this.invoiceService.GetInvoiceVmByOrder(pair.orderId)),
    );


//     this.invoiceVmForEdit$ = this.invoiceId$.pipe(
//       filter(iId => iId !== null),
// //    צריך לקחת בחשבון ORDERID מלא

//      switchMap(iId => this.invoiceService.getInvoiceVmByInvoice())
//     )

    this.newInvoiceVmDefault$ = combineLatest([this.invoiceId$,this.orderId$]).pipe(
      map(pair=>{return{invoiceId:pair[0],orderId:pair[1]}}),
      filter(pair=>pair.invoiceId === null),
      filter(pair=>pair.orderId === null),
      switchMap(iId=> this.invoiceService.GetDefultInvoiceVm())
      
    )

    this.mergeInvoiceVm$ = merge(this.newInvoiceVmByOrder$,this.newInvoiceVmDefault$/*,this.invoiceVmForEdit$*/).pipe(
      //takeUntil(this.destroy$)).subscribe(inv => {
       //    map(inv=> this.resetValueOfForm(inv)));
       map(inv => this.fixInvoiceVm(inv))
       );
    // })

   }
 
  // private resetValueOfForm(invVm:invoiceVm):invoiceVm
  // {
  //   invVm = this.fixInvoiceVm(invVm);

  //   return invVm;
  //  // let res = this.matchToInvoiceForm(invVm);

  //  // return res;
  // }

 
  private fixInvoiceVm(original:InvoiceVm):InvoiceVm
  {
      let res = {...original};
      if (res.invoiceActions === null){
        res.invoiceActions = [];
      }

      res.createdDate = this.dateService.dateTimeToDate(original.createdDate);
      res.receptionDate = this.dateService.dateTimeToDate(original.receptionDate);

      return res;
  }

  private initForm(){
    // var dToday = new Date();
    // var dTomorrow = new Date();
    // dToday.setHours(0, 0, 0, 0);
    // dTomorrow.setDate(dToday.getDate() + 1);//add 1 day
    

    //this.defaultDate = dToday.toISOString();

  }


  ngOnDestroy(): void {
    //this.destroy$.next();
  }



}
