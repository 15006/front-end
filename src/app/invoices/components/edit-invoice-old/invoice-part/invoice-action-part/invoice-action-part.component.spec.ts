import { ComponentFixture, TestBed } from '@angular/core/testing';

import { InvoiceActionPartComponent } from './invoice-action-part.component';

describe('InvoiceActionPartComponent', () => {
  let component: InvoiceActionPartComponent;
  let fixture: ComponentFixture<InvoiceActionPartComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ InvoiceActionPartComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(InvoiceActionPartComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
