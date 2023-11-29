import { ComponentFixture, TestBed } from '@angular/core/testing';

import { InvoicePartComponent } from './invoice-part.component';

describe('InvoicePartComponent', () => {
  let component: InvoicePartComponent;
  let fixture: ComponentFixture<InvoicePartComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ InvoicePartComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(InvoicePartComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
