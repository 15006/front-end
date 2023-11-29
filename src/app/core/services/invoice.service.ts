import { Injectable } from '@angular/core';
import {
  Invoice,
  InvoiceForUpload,
  InvoiceForPrint,
  InvoiceSearchForm,
  TaxInvoiceOption,
  InvoiceActionStatus,
  InvoiceForm,
  InvoiceVm,
  InvoiceActionVm,
  InvoiceCenteralizedForPrint,
} from '../entities/invoice';
import { Cooperative } from '../entities/Cooperative';
import {
  HttpClient,
  HttpParams,
  HttpErrorResponse,
} from '@angular/common/http';
import { promise, utils } from 'protractor';
//import {RequestOptions, Request, RequestMethod} from '@angular/http';
import { HttpHeaders } from '@angular/common/http';
import {
  Observable,
  Subscription,
  from,
  observable,
  combineLatest,
} from 'rxjs';
import { first, map, switchMap, take, tap, share } from 'rxjs/operators';
import { UrlService } from './url.service';
import { MetadataService } from './metadata.service';
import { timeout } from 'rxjs/operators';
import { UserService } from './user.service';
import { cache } from '@app/shared/tools/rxjs-operators/cache';
import { UntypedFormGroup } from '@angular/forms';
import emailjs from '@emailjs/browser';
import { InvoiceSearchItem } from '@app/invoices/services/invoices-search-item';
import { Project } from '../entities/project';
// import { User } from 'c:/try/123/456/znctr/after-design/front-end/src/app/core/entities/user';
//import { Observable/*, throwError*/ } from 'rxjs';
// import { EmailService } from 'emailjs/angular';

@Injectable({
  providedIn: 'root',
})
export class InvoiceService {
  private defaultInvoiceSearch$: Observable<InvoiceSearchForm>;

  invoiceVmByOrder: Observable<InvoiceVm>;
  private inv: InvoiceForUpload;
  private id: number;
  private name: string;
  private userId$: Observable<number>;
  private cooperativeId$: Observable<number>;
  public isLoading: boolean = false;
  fileFromSharePoint: any;
  sendToTheServer: any;
  retrieveOrderFlag: boolean = false;
  dirty: boolean;
  form: UntypedFormGroup;
  invoiceId: number;
  user;
  myInvoiceId: any;
  filePath: any;
  newFilePath: any;
  invoices: any[];
  listOfBlockedInvoices: any;
  statusFlag = { status: -100, flag: false };
  centeralizedInvoicesForPrint = { statusId: 0, listOfInvoices: '' }
  possibleProjectsValue: Project[] = [];

  isInvoiceActionStatusIdTouched: boolean;
  constructor(
    private http: HttpClient,
    private url: UrlService,
    private userService: UserService,
    private metadataService: MetadataService,
    // private emailService: EmailService
  ) {
    this.calcDefaults();
  }
  isBlocked(invoice): any {
    this.listOfBlockedInvoices = this.userService.res?.some(x =>
      x.invoiceID === invoice.invoiceId
    );
    return this.listOfBlockedInvoices
  }

  public async changeStatus(listOfInvoices: any, statusToChange: number) {
    this.cooperativeId$ = this.metadataService.getCooperativeId();
    let cooperativeId = await this.cooperativeId$.pipe(first()).toPromise();
    let user = (await this.metadataService.getUserPromise())
    let baseUrl = this.url.getUrl('invoices/changeStatus');
    return await this.http.get<any>(`${baseUrl}/${listOfInvoices}/${statusToChange}/${user.userId}/${cooperativeId}`)
      .toPromise();
  }


  private async GetInvoiceForUploadDetailsFromServer(
    invoiceId: string,
    packageId: string,
    cooperativeId: number
  ): Promise<InvoiceForUpload> {
    let base = this.url.getUrl('invoices/getInvoiceDetails');
    let userId = await this.userService.getUserId();
    try {
      let res = await this.http
        .get<InvoiceForUpload>(
          `${base}/${userId}/${invoiceId}/${packageId}/${cooperativeId}`
        )
        .toPromise();

      return res;
    } catch (ex) {
      console.log(`cannot get invoice ${invoiceId}`);
      let emptyInvoice: InvoiceForUpload = {
        invoiceId: '',
        invoiceNumber: '',
        receiver: 0,
        supplierId: '',
        supplierName: '',
        description: '',
        createdDate: '',
        receptionDate: '',
        notes: '',
        sumInvoice: null,
        invoiceDigitalId: '',
        fileName: '',
        filePath: '',
        isTaxInvoice: null,
      };

      return emptyInvoice;
    }
  }

  async displayInvoice(invoiceId: number) {
    this.cooperativeId$ = this.metadataService.getCooperativeId();
    let cooperativeId = await this.cooperativeId$.pipe(first()).toPromise();
    let user = ((await this.metadataService.getUserPromise()).userId)
    let base = this.url.getUrl('invoices/displayInvoice');
    let res = await this.http.get(`${base}/${user}/${cooperativeId}/${invoiceId}`, { responseType: 'blob' }).toPromise();
    //alert(JSON.stringify(res)+"  res")
    return res;
  }

  private getFromHttp<T>(url: string): Observable<T> {
    let fixedUrl = this.url.getUrl(url);
    return this.http.get<T>(fixedUrl);
  }

  private calcDefaults() {
    this.userId$ = this.userService.getUserId();

    this.defaultInvoiceSearch$ = this.userId$.pipe(
      switchMap((userId) =>
        this.getFromHttp<InvoiceSearchForm>(
          `invoices/getDefaultInvoiceSearch/${userId}`
        )
      ),
      cache()
    );
  }


  GetInvoiceAccordingToStatus(invoiceID: number): Observable<InvoiceVm> {
    this.userId$ = this.userService.getUserId();
    this.cooperativeId$ = this.metadataService.getCooperativeId()
    let base = this.url.getUrl('invoices/GetInvoiceAccordingToStatus');
    return combineLatest([this.userId$, this.cooperativeId$]).pipe(
      map(([userId, cooperativeId]) => `${base}/${invoiceID}/${userId}/${cooperativeId}`),
      switchMap((url) => this.http.get<InvoiceVm>(url))
    );
  }

  public getDefaultInvoiceSearch(): Observable<InvoiceSearchForm> {
    return this.defaultInvoiceSearch$;
  }
  public existInvoiceBySupplierAndInvoicveNo(
    supplierId: number,
    invoiceNumber: string
  ): Observable<InvoiceVm> {
    let base = this.url.getUrl('invoices/checkDuplicate');
    this.userId$ = this.userService.getUserId();
    this.cooperativeId$ = this.metadataService.getCooperativeId();
    try {
      let res = combineLatest([this.userId$, this.cooperativeId$]).pipe(
        switchMap(([userId, cooperativeId]) =>
          this.http.post<InvoiceVm>(base, {
            userId,
            cooperativeId,
            supplierId,
            invoiceNumber,
          })
        )
      );

      return res;
    } catch (ex) {
      console.log(`cannot get invoice ${invoiceNumber}`);
      return new Observable<InvoiceVm>((o) => {
        o.next(null);
      });
    }
  }
  /* from kobi hari
  public async GetInvoiceDetails(invId: string, pckgId: string,  coopId: number) : Promise<Invoice>
  {
    
    let invoicePromise = this.GetInvoiceDetailsFromServer(invId, pckgId, coopId);

    this.inv = await invoicePromise;
        
    return this.inv;

  }
  */

  public GetInvoiceVmByOrder(orderId: number): Observable<InvoiceVm> {
    this.userId$ = this.userService.getUserId();
    this.cooperativeId$ = this.metadataService.getCooperativeId();

    let baseUrl = this.url.getUrl('invoices/getInvoiceVmByOrder');
    this.invoiceVmByOrder = combineLatest([
      this.userId$,
      this.cooperativeId$,
    ]).pipe(
      map(
        ([userId, cooperativeId]) =>
          `${baseUrl}/${userId}/${orderId}/${cooperativeId}`
      ),
      switchMap((url) => this.http.get<InvoiceVm>(url))
    );
    return this.invoiceVmByOrder;
  }

  public GetDefultInvoiceVm() {

    this.userId$ = this.userService.getUserId();
    this.cooperativeId$ = this.metadataService.getCooperativeId();

    let baseUrl = this.url.getUrl('invoices/getDefultInvoiceVm');

    return combineLatest([this.userId$, this.cooperativeId$]).pipe(
      map(([userId, cooperativeId]) => `${baseUrl}/${userId}/${cooperativeId}`),
      switchMap((url) => this.http.get<InvoiceVm>(url))
    );
  }

  public GetDefultInvoiceActionVm(): Observable<InvoiceActionVm> {
    this.userId$ = this.userService.getUserId();
    this.cooperativeId$ = this.metadataService.getCooperativeId();
    let baseUrl = this.url.getUrl('invoices/getDefultInvoiceActionVm');

    return combineLatest([this.userId$, this.cooperativeId$]).pipe(
      map(([userId, cooperativeId]) => `${baseUrl}/${userId}/${cooperativeId}`),
      switchMap((url) => this.http.get<InvoiceActionVm>(url))
    );
  }

  public GetInoviceActionVmByOrder(
    orderId: number
  ): Observable<InvoiceActionVm> {
    this.userId$ = this.userService.getUserId();
    this.cooperativeId$ = this.metadataService.getCooperativeId();
    let baseUrl = this.url.getUrl('invoices/getInvoiceActionVmByOrder');

    return combineLatest([this.userId$, this.cooperativeId$]).pipe(
      map(
        ([userId, cooperativeId]) =>
          `${baseUrl}/${userId}/${orderId}/${cooperativeId}`
      ),
      switchMap((url) => this.http.get<InvoiceActionVm>(url))
    );
  }
  async send() {
    //הלינק לשינוי הודעת המייל הנשלחת במקרה של העלת חשבונית עבור סטטוס 79
    //https://dashboard.emailjs.com/admin
    //15006@rnz.co.il
    //Zut20264
    //כרגע רשומה הכתובת של רעות
    // המייל שהיה עד עכשיו
    //noamHatzviMail@gmail.com
    //nsjs224nsjs224
    const result = this.metadataService.getUserPromise();
    this.userService.myUser = await result; //}
    emailjs.init('R9EWHOmv8hnGkHDqG');
    let response = await emailjs.send('service_3zljez7', 'template_rf4g5qs', {
      from_name: 'נועם הצבי',
      to_name: 'רעות',
      from_snif_name: this.userService.myUser.branchName,
      message: `העלו חשבונית עבור אישור ביצוע ${this.myInvoiceId} שבסטטוס  79 לצפיה בלינק המצ"\ב`,
      link: this.newFilePath,
    });
    //alert('ההודעה נשלחה בהצלחה!!');
  }
  public GetInvoiceById(id: number) {
    this.userId$ = this.userService.getUserId();
    this.cooperativeId$ = this.metadataService.getCooperativeId();
    let baseUrl = this.url.getUrl(`invoices/${id}`);
    return combineLatest([this.userId$, this.cooperativeId$]).pipe(
      map(([userId, cooperativeId]) => `${baseUrl}/${userId}/${cooperativeId}`),
      switchMap((url) => this.http.get<InvoiceVm>(url))
    );
  }

  public GetInvoiceDetails(
    invId: string,
    pckgId: string,
    coopId: number
  ): InvoiceForUpload {
    let invoice = this.GetInvoiceForUploadDetailsFromServer(
      invId,
      pckgId,
      coopId
    );

    invoice.then((i) => (this.inv = i));
    console.log(this.inv);

    return this.inv;
  }

  public SaveInvoice(invoice: InvoiceVm): Observable<InvoiceVm> {
    if (invoice.invoiceActions[0].invoiceActionStatusId === undefined) {
      invoice.invoiceActions[0].invoiceActionStatusId = -1
    }
    if ((invoice.invoiceActions[0].projectId != null) && (invoice.invoiceActions[0].projectId != 0)) {
      invoice.invoiceActions[0].projectNum =
        (this.possibleProjectsValue.filter(p => p.projectId === invoice.invoiceActions[0].projectId)[0].projectNum)
    }
    let base = this.url.getUrl('invoices/save');
    this.userId$ = this.userService.getUserId();
    this.cooperativeId$ = this.metadataService.getCooperativeId();
    return combineLatest([this.userId$, this.cooperativeId$]).pipe(
      map(([userId, cooperativeId]) => `${base}/${userId}/${cooperativeId}/${this.statusFlag.status}/${this.statusFlag.flag}`),
      switchMap((url) => this.http.post<InvoiceVm>(url, invoice))
    );
  }

  public BeforeUpload(
    invFile: File,
    theInvoice: InvoiceForUpload,
    isTaxInvoice: number,
    userId: number
  ): InvoiceForUpload {
    //debugger;
    theInvoice.isTaxInvoice = isTaxInvoice;
    let invoice = this.UploadInvoiceFile(
      invFile,
      theInvoice /*,  isTaxInvoice*/,
      userId
    );
    invoice.then((i) => (this.inv = i));
    //console.log(this.inv);
    return this.inv;
  }

  public async downloadDigitalInvoice(): Promise<File> {
    try {
      let base = this.url.getUrl('digitalinvoices/getDigitalInvoice');

      let res = await this.http.get<File>(base).toPromise();
      return res;
    } catch (ex) {
      console.log(ex);
    }
  }
  public async UploadInvoiceFile(
    invFile: File,
    theInvoice: InvoiceForUpload,
    /*isTaxInvoice: number,*/ userId: number
  ): Promise<InvoiceForUpload> {
    //let base = this.url.getUrl('invoices/upLoadFile');
    //debugger;
    //שם  תוכנה-עמותה-שנה-ספק:מספר 6 ספרות ושם
    let theCooperative = await this.metadataService
      .getCooperative()
      .pipe(take(1))
      .toPromise();

    let cooperativeId = theCooperative.cooperativeId;
    let packageId = "0";
    //let inv = this.GetInvoiceDetails(theInvoice.invoiceId, packageId, cooperativeId);
    //console.log("theCooperative: ",theCooperative);
    let cooperativeName = theCooperative.cooperativeName;
    let isTaxInvoice = theInvoice.isTaxInvoice;
    //let fileName = invFile.name;
    let invoiceId = theInvoice.invoiceId;

    //this.userId$ = this.userService.getUserId();
    //console.log('******** isTaxInvoice from service **********');
    //console.log(isTaxInvoice);
    //console.log('******** isTaxInvoice from service **********');
    let slesh = '!';

    //let invoiceDetails = `${cooperativeId}${slesh}${cooperativeName}${slesh}${invFile.name}${slesh}${invoiceId}${slesh}${isTaxInvoice}${slesh}${userId}`;
    let invoiceDetails = `${cooperativeId}${slesh}${cooperativeName}${slesh}${invFile.name}${slesh}${invoiceId}${slesh}${isTaxInvoice}${slesh}${userId}`;


    const fd = new FormData();
    fd.append('invoice', invFile, invoiceDetails);

    try {

      let base = this.url.getUrl('invoices/upload');
      //console.log('accessing: ' + base);
      //console.log(theInvoice);
      let res = await this.http.post<InvoiceForUpload>(base, fd).toPromise();
      //console.log(res);
      //debugger;
      if (res.sumInvoice == 0) {
        alert('החשבונית לא עלתה, אינך מורשה לטפל בחשבונית זו');
        // alert(res.description);
        return null;
      } else {
        //alert(' החשבונית הדיגיטלית הועלתה בהצלחה, שם הקובץ הינו ' + res.fileName + '\n מספר אישור העלאה הינו ' +  res.invoiceDigitalId + '\n יש להביא לרכזת החשבוניות: ' + '\n 1. אישור ביצוע שמצוין עליו בכתב יד מספר אישור העלאה או שם הקובץ שהתקבל' + '\n 2. הדפסה של החשבונית הדיגיטלית');
        this.cooperativeId$ = this.metadataService.getCooperativeId();
        let cooperativeId = await this.cooperativeId$.pipe(first()).toPromise();
        this.user = await this.metadataService.getUserPromise();
        debugger;

        alert(
          '\n\n החשבונית הדיגיטלית הועלתה בהצלחה! ' +
          '\n\n מספר אישור העלאה הינו ' +
          res.invoiceDigitalId +
          '\n\n שם הקובץ הינו ' +
          res.fileName +
          '\n\n יש להעביר לרכזת החשבוניות: ' +
          '\n 1. אישור ביצוע שמצוין עליו בכתב יד מספר אישור העלאה או שם הקובץ שהתקבלו מהמערכת (מוצגים בחלונית זו)' +
          '\n 2. הדפסה של החשבונית הדיגיטלית'
        );
        //alert(' החשבונית הדיגיטלית הועלתה בהצלחה, שם הקובץ הינו ' + res.fileName + '\n יש להביא לרכזת החשבוניות: ' + '\n 1. אישור ביצוע שמצוין עליו בכתב יד שם הקובץ שהתקבל' + '\n 2. הדפסה של החשבונית הדיגיטלית');
        return res;
      }
    } catch (ex) {
      console.log(ex.message);
      alert(' התהליך  נכשל ');
      return null;
    }
  }

  public async GetInvoices(
    packageId: number,
    invoiceId: number,
    userId: number,
    cooperativeId: number //: Promise<InvoiceForPrint[]>
  ) {
    let base = this.url.getUrl('invoices/getInvoices');

    try {
      packageId = this.convertNullToMinOne(packageId);
      invoiceId = this.convertNullToMinOne(invoiceId);

      //console.log('+++++cooperativeId '+cooperativeId);

      return await this.http
        .get<InvoiceForPrint[]>(
          `${base}/${invoiceId}/${packageId}/${userId}/${cooperativeId}`
        )
        .toPromise();
    } catch (ex) {
      console.log('בעיה בשליחה לאמיתי');
      console.log(ex);
    }
  }


  public async GetCenteralizedInvoicesForPrint(
    packageId: number,
    invoiceList: string,
    userId: number,
    cooperativeId: number //: Promise<InvoiceForPrint[]>
  ) {
    let base = this.url.getUrl('invoices/GetCenteralizedInvoicesForPrint');

    try {
      packageId = this.convertNullToMinOne(packageId);

      return await this.http
        .get<InvoiceCenteralizedForPrint[]>(
          `${base}/${invoiceList}/${packageId}/${userId}/${cooperativeId}`
        )
        .toPromise();
    } catch (ex) {
      console.log('בעיה בשליחה לאמיתי');
      console.log(ex);
    }
  }

  public GetTaxInvoiceOptions(
    cooperativeId: number
  ): Observable<TaxInvoiceOption[]> {
    this.userId$ = this.userService.getUserId();
    // this.cooperativeId$  = this.metadataService.getCooperativeId();

    //  let userId = await this.userService.getUserId()
    //  .pipe(first())
    //  .toPromise();
    let base = this.url.getUrl('invoices/getTaxInvoiceOptions');

    try {
      return this.userId$.pipe(
        map((userId) => `${base}/${userId}/${cooperativeId}`),
        switchMap((url) => this.http.get<TaxInvoiceOption[]>(url))
      );
    } catch (ex) {
      console.log('בעיה בשליחה לאמיתי');
      console.log(ex);
    }
  }

  private convertNullToMinOne(param: any): number {
    if (param == null || param == '') {
      return -1;
    } else {
      return param;
    }
  }

  public async CreatePackage(
    existPackageId: number,
    invoiceId: number,
    userId: number,
    cooperativeId: number
  ): Promise<string> {
    let base = this.url.getUrl('invoices/package');

    try {
      //console.log('לפני שליחה לאמיתי');
      if (existPackageId == null) {
        existPackageId = 0;
      }
      if (invoiceId == null) {
        invoiceId = 0;
      }
      /*
      let _existPackageId = 1;
      let _invoiceId = 1;
      let _userId = 15006;
      let _cooperativeId = 1;*/
      /*
      let res = await this.http.get(`${base}/${_existPackageId}/${_invoiceId}/${_userId}/${_cooperativeId}`) 
              .toPromise();
      */
      let res = await this.http
        .get(
          `${base}/${existPackageId}/${invoiceId}/${userId}/${cooperativeId}`
        )
        .toPromise();
      //console.log('1 אחרי שליחה לאמיתי');
      //console.log('2 אחרי שליחה לאמיתי');
      return res.toString();
    } catch (ex) {
      console.log('בעיה בשליחה לאמיתי');
      console.log(ex);
    }
  }

  public async GetInvoiceForPrint(
    invoiceId: number,
    cooperativeId: number
  ): Promise<InvoiceForPrint> {
    let existPackageId = null;

    //console.log('GetInvoiceForPrint');

    let userId = await this.userService.getUserId().pipe(first()).toPromise();

    let invoice = await this.GetInvoices(
      existPackageId,
      invoiceId,
      userId,
      cooperativeId
    );
    debugger;
    return invoice[0];
  }

  public async GetCenteralizedInvoiceForPrint(
    invoiceList: string,
    cooperativeId: number
  ): Promise<InvoiceCenteralizedForPrint[]> {
    let existPackageId = null;
    //console.log('GetInvoiceForPrint');

    let userId = await this.userService.getUserId().pipe(first()).toPromise();

    let CenteralizedInvoicesForPrint = await this.GetCenteralizedInvoicesForPrint(
      existPackageId,
      invoiceList,
      userId,
      cooperativeId
    );
    debugger;
    return CenteralizedInvoicesForPrint;
  }


  public searchInvoices(
    invoiceSearch: InvoiceSearchForm,
    cooperativeId: number
  ): Observable<InvoiceSearchItem[]> {
    this.userId$ = this.userService.getUserId();

    let baseUrl = this.url.getUrl('invoices/GetInvoiceActionDetails');
    let invoiceId = this.convertNullToMinOne(invoiceSearch.invoiceId);
    let invoiceNumber = this.convertNullToMinOne(invoiceSearch.invoiceNumber);
    let packageId = this.convertNullToMinOne(invoiceSearch.packageId);
    let orderId = this.convertNullToMinOne(invoiceSearch.orderId);
    let supplier = this.convertNullToMinOne(invoiceSearch.supplier);
    let fromInvoiceStatus = this.convertNullToMinOne(
      invoiceSearch.fromInvoiceStatus
    );
    let toInvoiceStatus = this.convertNullToMinOne(
      invoiceSearch.toInvoiceStatus
    );
    let snif = this.convertNullToMinOne(invoiceSearch.snif);

    return this.userId$.pipe(
      map(
        (userId) =>
          `${baseUrl}/${invoiceId}/${packageId}/${orderId}/${userId}/${cooperativeId}/${supplier}/${fromInvoiceStatus}/${toInvoiceStatus}/${snif}/${invoiceNumber}`
      ),
      switchMap((url) => this.http.get<InvoiceSearchItem[]>(url)),
    );
  }

  public getInvoiceActionStatusForEdit(): Observable<InvoiceActionStatus[]> {
    this.userId$ = this.userService.getUserId();
    this.cooperativeId$ = this.metadataService.getCooperativeId();

    let baseUrl = this.url.getUrl('invoiceActionStatus/getforEditInvoice');

    return combineLatest([this.userId$, this.cooperativeId$]).pipe(
      map(([userId, cooperativeId]) => `${baseUrl}/${userId}/${cooperativeId}`),
      switchMap((url) => this.http.get<InvoiceActionStatus[]>(url))
    );
  }

  public getInvoiceActionStatus(): Observable<InvoiceActionStatus[]> {
    this.userId$ = this.userService.getUserId();
    this.cooperativeId$ = this.metadataService.getCooperativeId();

    let baseUrl = this.url.getUrl('invoiceActionStatus/get');

    return combineLatest([this.userId$, this.cooperativeId$]).pipe(
      map(([userId, cooperativeId]) => `${baseUrl}/${userId}/${cooperativeId}`),
      switchMap((url) => this.http.get<InvoiceActionStatus[]>(url))
    );
  }
}
