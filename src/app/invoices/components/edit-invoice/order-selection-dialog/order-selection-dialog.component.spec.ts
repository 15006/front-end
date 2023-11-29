import { ComponentFixture, TestBed } from '@angular/core/testing';

import { OrderSelectionDialogComponent } from './order-selection-dialog.component';

describe('OrderSelectionDialogComponent', () => {
  let component: OrderSelectionDialogComponent;
  let fixture: ComponentFixture<OrderSelectionDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ OrderSelectionDialogComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(OrderSelectionDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
