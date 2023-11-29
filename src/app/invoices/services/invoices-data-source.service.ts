import { CollectionViewer, DataSource } from '@angular/cdk/collections';
import { Injectable } from '@angular/core';
import { MatSort, Sort } from '@angular/material/sort';
import { BehaviorSubject, combineLatest, Observable } from 'rxjs';
import { filter, map, startWith, switchMap, tap } from 'rxjs/operators';
import {
  InvoiceForUpload,
  InvoiceSearchForm,
} from 'src/app/core/entities/invoice';
import { User } from 'src/app/core/entities/user';
import { InvoiceService } from 'src/app/core/services/invoice.service';
import { MetadataService } from 'src/app/core/services/metadata.service';
import { InvoiceSearchItem } from './invoices-search-item';
import { MatSnackBar } from '@angular/material/snack-bar';

@Injectable({ providedIn: 'root' })
export class InvoiceDataSourceService implements DataSource<InvoiceSearchItem> {
  private seaches$ = new BehaviorSubject<[InvoiceSearchForm, number]>(null);
  private matSort$ = new BehaviorSubject<MatSort>(null);

  private user$!: Observable<User>;
  areResult: InvoiceSearchItem[];

  constructor(
    private invoiceService: InvoiceService,
    private metaService: MetadataService,
    private snackBar: MatSnackBar,

  ) {
    this.user$ = this.metaService.getUser();
  }

  compare(a: InvoiceSearchItem, b: InvoiceSearchItem, sort: Sort): number {
    let key1 = a[sort.active];
    let key2 = b[sort.active];

    let res = key1 > key2 ? 1 : -1;
    return sort.direction === 'asc' ? res : -res;
  }

  search(invoiceSearch: InvoiceSearchForm, cooperativeId: number) {
    this.seaches$.next([invoiceSearch, cooperativeId]);
  }

  getResults(): Observable<readonly InvoiceSearchItem[]> {
    let invoice$ = this.seaches$.pipe(
      filter((val) => val !== null),
      switchMap(([form, coopId]) =>
        this.invoiceService.searchInvoices(form, coopId)
      ),
      map(ans => this.areResult = ans),
      startWith([])
    );

    let sort$ = this.matSort$.pipe(
      filter((val) => val !== null),
      switchMap((matSort) =>
        matSort.sortChange.pipe(
          startWith({ active: matSort.active, direction: matSort.direction })
        )
      )
    );

    return combineLatest([invoice$, sort$, this.user$]).pipe(
      map(([invoice, sort, user]) =>
        this.createSortItemArray(invoice, sort, user)
      )
    );
  }
  createSortItemArray(
    invoice: InvoiceForUpload[],
    sort: Sort,
    user: User
  ): InvoiceSearchItem[] {
    let item = invoice.map((invoice) =>
      this.invocieToInvoiceSearchItem(invoice, user)
    );
    this.invoiceService.isLoading = false;
    if (this.areResult && item.length === 0) {
      let snackBar = this.snackBar.open(`לא נמצאו תוצאות`, 'סגור', {
        duration: 3000,
      });
    } if (!sort) return item;
    return item.sort((a, b) => this.compare(a, b, sort));
  }

  invocieToInvoiceSearchItem(
    invoice: InvoiceForUpload,
    user: User
  ): InvoiceSearchItem {
    return {
      ...invoice,
      isPrintable: true, //(invoice.sumInvoice >= 1),
      isEditable: false, //(invoice.sumInvoice >= 1),
      isUploaded: Number(invoice.invoiceDigitalId) > 0,
    };
  }

  setSort(matSort: MatSort) {
    this.matSort$.next(matSort);
  }

  connect(
    collectionViewer: CollectionViewer
  ): Observable<readonly InvoiceSearchItem[]> {
    return this.getResults();
  }
  disconnect(): void { }
}
