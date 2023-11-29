import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PrintCenteralizedInvoiceComponent } from './print-centeralized-invoice.component';

describe('PrintCenteralizedInvoiceComponent', () => {
  let component: PrintCenteralizedInvoiceComponent;
  let fixture: ComponentFixture<PrintCenteralizedInvoiceComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ PrintCenteralizedInvoiceComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PrintCenteralizedInvoiceComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
