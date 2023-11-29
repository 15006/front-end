import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DownloadInvoicesPackageComponent } from './download-invoices-package.component';

describe('DownloadInvoicesPackageComponent', () => {
  let component: DownloadInvoicesPackageComponent;
  let fixture: ComponentFixture<DownloadInvoicesPackageComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ DownloadInvoicesPackageComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(DownloadInvoicesPackageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
