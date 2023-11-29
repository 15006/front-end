import { ComponentFixture, TestBed } from '@angular/core/testing';

import { NavInvoiceComponent } from './nav-invoice.component';

describe('NavInvoiceComponent', () => {
  let component: NavInvoiceComponent;
  let fixture: ComponentFixture<NavInvoiceComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ NavInvoiceComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(NavInvoiceComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
