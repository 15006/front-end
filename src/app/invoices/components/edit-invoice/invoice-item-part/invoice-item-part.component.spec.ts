import { ComponentFixture, TestBed } from '@angular/core/testing';

import { InvoiceItemPartComponent } from './invoice-item-part.component';

describe('InvoiceItemPartComponent', () => {
  let component: InvoiceItemPartComponent;
  let fixture: ComponentFixture<InvoiceItemPartComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ InvoiceItemPartComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(InvoiceItemPartComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
