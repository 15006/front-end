import { ComponentFixture, TestBed } from '@angular/core/testing';

import { InvoiceActionContentComponent } from './invoice-action-content.component';

describe('InvoiceActionContentComponent', () => {
  let component: InvoiceActionContentComponent;
  let fixture: ComponentFixture<InvoiceActionContentComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ InvoiceActionContentComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(InvoiceActionContentComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
