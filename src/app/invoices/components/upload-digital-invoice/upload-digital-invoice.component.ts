import {
  Invoice,
  InvoiceForPrint,
  TaxInvoiceOption,
} from 'src/app/core/entities/invoice';
import { MetadataService } from 'src/app/core/services/metadata.service';
import { InvoiceService } from 'src/app/core/services/invoice.service';
import { Component, OnInit, OnDestroy } from '@angular/core';
import { Observable, BehaviorSubject, Subject } from 'rxjs';
import {
  distinctUntilChanged,
  filter,
  first,
  map,
  takeUntil,
  tap,
} from 'rxjs/operators';
import { combineLatest } from 'rxjs';
import { switchMap } from 'rxjs/operators';
import { Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { DomSanitizer } from '@angular/platform-browser';
import { cache } from 'src/app/shared/tools/rxjs-operators/cache';
import {
  UntypedFormControl,
  UntypedFormGroup,
  Validators,
} from '@angular/forms';
import { TaxInvoiceOptionForm } from 'src/app/core/entities/invoice';
import { TaxInvoiceOptionService } from '../../services/tax-invoice-option.service';
import { TaxInvoiceOptionMark } from '../../services/tax-invoice-option-mark';
import { HttpClient } from '@angular/common/http';
import { UserService } from '@app/core/services/user.service';
import { OrdersService } from '@app/core/services/orders.service';

@Component({
  selector: 'app-upload-digital-invoice',
  templateUrl: './upload-digital-invoice.component.html',
  styleUrls: ['./upload-digital-invoice.component.scss'],
  providers: [TaxInvoiceOptionService],
})
export class UploadDigitalInvoiceComponent implements OnInit, OnDestroy {
  url: any;
  user: any;
  invoiceId: any;
  existFilePath: any;
  newFilePath: string[];

  onChange(target: HTMLInputElement) {
    console.log('my files are: ', target.files);

    if (target.files && target.files[0]) {
      const file = target.files[0];
      const url = URL.createObjectURL(file);
      const safeUrl = this.sanitizer.bypassSecurityTrustResourceUrl(url);
      this.fileSource = safeUrl;

      console.log(this.fileSource);
    }
  }
  fileSource: any = null;
  myFileSource: any = null;
  invoice$: Observable<InvoiceForPrint>;
  //invoice: Promise<InvoiceForPrint>;
  cooperativeId$: Observable<number>;
  invoiceId$ = new BehaviorSubject<number>(-1);
  form: UntypedFormGroup;
  taxInvoiceOptions$: Observable<TaxInvoiceOption[]>;
  destroy$ = new Subject<void>();

  constructor(
    public invoiceService: InvoiceService,
    private metadataService: MetadataService,
    private taxInvoiceOptionService: TaxInvoiceOptionService,
    private sanitizer: DomSanitizer,
    private http: HttpClient,
    private userService: UserService,
    private dialogRef: MatDialogRef<UploadDigitalInvoiceComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) { }

  onNoClick(): void {
    // this.dialogRef.close();
  }

  onChangeFile(myFileTarget: HTMLInputElement) {
    // console.log(myFileTarget.files[0]);

    if (myFileTarget.files && myFileTarget.files[0]) {
      const file = myFileTarget.files[0];
      //console.log(file);

      this.form.patchValue({
        selectedFile: file,
      });
      // file="C:\\znCtrUploadFiles\\DigitalInvoices\\צביה\\2022\\החברה_המרכזית_לפיתוח_השומרון-700408\\ID463632-N001482(25).pdf"
      const url = URL.createObjectURL(file);
      //console.log('url ', url);
      const safeUrl = this.sanitizer.bypassSecurityTrustResourceUrl(url);
      this.fileSource = safeUrl;
      // this.fileSource=
      // this.fileSource='https://zvianet-my.sharepoint.com/personal/15006_rnz_co_il/_layouts/15/onedrive.aspx?listurl=https%3A%2F%2Fzvianet%2Esharepoint%2Ecom%2Fsites%2FDigitalInvoices%2EnoamHatzvi%2FShared%20Documents&id=%2Fsites%2FDigitalInvoices%2EnoamHatzvi%2FShared%20Documents%2F%D7%A7%D7%95%D7%91%D7%A5%20%D7%A0%D7%A2%D7%95%D7%9C%2EPNG&parent=%2Fsites%2FDigitalInvoices%2EnoamHatzvi%2FShared%20Documents'
      // this.fileSource="https://file:C:\\Users\\15006\\Pictures\\Screenshots\\nh.PNG"
      // alert(this.fileSource)
      //this.fileSource='https://zvianet-my.sharepoint.com/personal/15006_rnz_co_il/_layouts/15/onedrive.aspx?listurl=https%3A%2F%2Fzvianet%2Esharepoint%2Ecom%2Fsites%2FDigitalInvoices%2EnoamHatzvi%2FShared%20Documents&id=%2Fsites%2FDigitalInvoices%2EnoamHatzvi%2FShared%20Documents%2F%D7%A7%D7%95%D7%91%D7%A5%20%D7%A0%D7%A2%D7%95%D7%9C%2EPNG&parent=%2Fsites%2FDigitalInvoices%2EnoamHatzvi%2FShared%20Documents'
    }
  }
  async displayInvoice() {
    try {
      this.existFilePath = await this.invoiceService.displayInvoice(this.data.invoice)
      //  alert(JSON.stringify(this.f)+"    f")
      debugger;
      var blob = new Blob([this.existFilePath], { type: this.existFilePath.type });
      var blobURL = URL.createObjectURL(blob);
      window.open(blobURL);
    }
    catch (ex) {
      console.error(ex.message);
    }
  }

  async ngOnInit() {
    // this.getCanvas();
    if (this.data.isUpload) {
      this.displayInvoice()
    }
    this.invoiceId$.next(Number(this.data.invoice));

    this.cooperativeId$ = this.metadataService.getCooperativeId();

    this.invoice$ = combineLatest([this.invoiceId$, this.cooperativeId$]).pipe(
      distinctUntilChanged(),
      filter(([inv, cop]) => inv !== null && cop !== null),
      switchMap(([invoiceId, cooperativeId]) =>
        this.getInvoiceById(Number(invoiceId), Number(cooperativeId))
      ),
      cache()
    );

    this.initForm();
    this.control('invoiceId').setValue(this.data.invoice);

    // debugger;
    // this.fileSource = "https://iis16.noamzvia.org.il/znCtrUploadFiles/DigitalInvoices/%D7%A6%D7%91%D7%99%D7%94/2018/%D7%90%D7%95%D7%93%D7%99_%D7%9E%D7%99%D7%96%D7%95%D7%92_%D7%90%D7%95%D7%99%D7%A8-702969/ID413568-N001076.pdf";
    // const file = myFileTarget.files[0];

    //   this.form.patchValue({
    //     selectedFile: file
    //   });
    //this.control('taxInvoiceOption').setValue(this.checkTaxInvoiceOptionId);
    // this.form.patchValue({taxInvoiceOption:this.checkTaxInvoiceOptionId});
    // console.log('setvalue-taxInvoiceOption=>',this.control('taxInvoiceOption').value);
  }

  private async initForm() {
    this.form = new UntypedFormGroup({
      invoiceId: new UntypedFormControl(null, Validators.required),
      selectedFile: new UntypedFormControl(null, Validators.required),
      taxInvoiceOption: new UntypedFormControl(null, Validators.min(0)),
    });

    this.taxInvoiceOptions$ = combineLatest([
      this.invoice$,
      this.cooperativeId$,
    ]).pipe(
      distinctUntilChanged(),
      filter(([inv, copId]) => inv !== null && copId !== null),
      switchMap(([inv, copId]) =>
        this.taxInvoiceOptionService.GetTaxInvoiveOptionWithTheChackItemMarked(
          inv,
          copId
        )
      ),
      cache()
    );
    //debugger;
    //let di = this.invoiceService.downloadDigitalInvoice();
  }

  private async getInvoiceById(
    invoiceId: number,
    cooperativeId: number
  ): Promise<InvoiceForPrint> {
    return this.invoiceService.GetInvoiceForPrint(invoiceId, cooperativeId);
  }

  control(name: keyof TaxInvoiceOptionForm): UntypedFormControl {
    return this.form.get(name) as UntypedFormControl;
  }

  Close() {
    this.dialogRef.close();
  }

  public async UpdloadInvoiceAndClose() {
    try {
      let uploadDigitalInvoice = this.form.getRawValue();
      //  console.log('uploadDigitalInvoice',JSON.stringify(uploadDigitalInvoice) );
      let cooperativeId = await this.cooperativeId$.pipe(first()).toPromise();
      let invoice = await this.invoice$.pipe(first()).toPromise();
      invoice.isTaxInvoice = uploadDigitalInvoice.taxInvoiceOption;
      let user = await this.metadataService.getUser().toPromise();

      let file = this.form.get('selectedFile').value;

      //let inv = await this.invoiceService.UploadInvoiceFile(file ,invoice,uploadDigitalInvoice.taxInvoiceOption,user.userId);
      let inv = await this.invoiceService.UploadInvoiceFile(
        file,
        invoice,
        user.userId
      );
      if (inv !== null) {
        this.newFilePath = inv.filePath.split('DigitalInvoices');
        this.invoiceService.newFilePath = `file://iis16.noamzvia.org.il/di/${this.newFilePath[1]}`;
        // this.invoiceService.newFilePath = `file://iis16.noamzvia.org.il/di/${inv.filePath.substring(42, inv.filePath.length - 1)}`;
        this.invoiceService.myInvoiceId = inv.invoiceId;
        let invoice

        invoice = await this.invoiceService.GetInvoiceAccordingToStatus(+inv.invoiceId).pipe(first()).toPromise();
        if (invoice.invoiceActions[0].invoiceActionStatusID === 79) {
          this.invoiceService.send();
        }
        this.dialogRef.close();
      }
    } catch (ex) {
      console.log(ex.message);
    }
  }

  ngOnDestroy() {
    this.destroy$.next();
  }
}
