import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EditInvoiceOldComponent } from './edit-invoice-old.component';

describe('EditInvoiceOldComponent', () => {
  let component: EditInvoiceOldComponent;
  let fixture: ComponentFixture<EditInvoiceOldComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ EditInvoiceOldComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(EditInvoiceOldComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
