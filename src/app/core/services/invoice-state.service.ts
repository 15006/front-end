import { Injectable } from "@angular/core";
import { Subject } from "rxjs";
import { Observable } from "rxjs";
import { InvoiceActionVm, InvoiceVm } from "../entities/invoice";
import { InvoiceService } from "./invoice.service";

@Injectable({
    providedIn: 'root'
})
export class InvoiceStateService {
    private updateState: Subject<InvoiceVm>;
    private updateSelected: Subject<InvoiceActionVm>;
    private loadingSubject = new Subject<boolean>();
    private invoice$: Observable<InvoiceVm>;
    private selectedAction$: Observable<InvoiceActionVm>;
    public invoice: InvoiceVm;
    public selectedAction: InvoiceActionVm;
    public loading: boolean;
    public totalSum: number;
    public actionSum: number;
    public beforeChange: InvoiceVm;
    public vatIncluded: boolean = true;
    private loading$: Observable<boolean>;


    constructor(private invoiceService: InvoiceService,) {
        this.updateState = new Subject<InvoiceVm>();
        this.updateSelected = new Subject<InvoiceActionVm>();
        this.loadingSubject = new Subject<boolean>();


        this.loading$ = new Observable<boolean>(observer => {
            this.loadingSubject.subscribe(data => {
                observer.next(data);
                this.loading = data;
            });
        });

        this.selectedAction$ = new Observable<InvoiceActionVm>(observer => {
            this.updateSelected.subscribe(data => {
                observer.next(data);
                this.selectedAction = data;
            });
        });

        // When the invoice is updated, update the selected action
        this.invoice$ = new Observable<InvoiceVm>(observer => {
            this.updateState.subscribe(data => {
                const idChanged = !!this.invoice.invoiceId && this.invoice.invoiceId !== data.invoiceId;
                this.invoice = data;
               
                if (invoiceService.isInvoiceActionStatusIdTouched) {
                    invoiceService.isInvoiceActionStatusIdTouched=false;
                    this.invoiceService.statusFlag = { status: -100, flag: false };
                    if (this.invoice.invoiceActions.length > 1) {
                        this.invoice.invoiceActions.forEach(action => {
                            if (action.invoiceActionStatusId !== 0 && action.invoiceActionStatusId !== -1) {
                                if (this.invoiceService.statusFlag.status === -100) {
                                    this.invoiceService.statusFlag.status = action.invoiceActionStatusId  //The first InvoiceAction.Status <> 0
                                    if (this.invoice.invoiceActions.some(el => el.invoiceActionStatusId !== this.invoiceService.statusFlag.status && el.invoiceActionStatusId > 10 &&  this.invoiceService.statusFlag.status>10)) {
                                        this.invoiceService.statusFlag.flag = true
                                    }
                                }
                            }
                        })
                    }
                }
                observer.next(data);
                if (idChanged || !this.selectedAction) {
                    this.selectedAction = data.invoiceActions?.length ? data.invoiceActions[0] : null;
                } else {
                    this.selectedAction = data.invoiceActions?.find(x => x.invoiceActionId === this.selectedAction.invoiceActionId) || null;
                }
                // if (this.selectedAction)
                //     this.setSelectedAction(this.selectedAction);
            });
        });
    }

    setLoading(loading: boolean): void {
        this.loadingSubject.next(loading);
    }

    getLoadingObservable(): Observable<boolean> {
        return this.loading$;
    }

    setValue(data: InvoiceVm = null): void {
        data = data || {} as InvoiceVm;
        if (!data?.invoiceActions) {
            data.invoiceActions = [{
                description: 'ללא תיאור',
            }] as InvoiceActionVm[];
        }
        this.invoice = data;
        this.updateState.next(this.invoice);
    }

    getObservable(): Observable<InvoiceVm> {
        return this.invoice$;
    }

    setSelectedAction(action: InvoiceActionVm = null): void {
        if (action) {
            this.selectedAction = action;
        }
        this.updateSelected.next(this.selectedAction);
    }

    getSelectedActionObservable(): Observable<InvoiceActionVm> {
        return this.selectedAction$;
    }
}