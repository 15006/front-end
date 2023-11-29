import { ComponentFixture, TestBed } from '@angular/core/testing';

import { InvoiceActionItemsComponent } from './invoice-action-items.component';

describe('InvoiceActionItemsComponent', () => {
  let component: InvoiceActionItemsComponent;
  let fixture: ComponentFixture<InvoiceActionItemsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ InvoiceActionItemsComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(InvoiceActionItemsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
