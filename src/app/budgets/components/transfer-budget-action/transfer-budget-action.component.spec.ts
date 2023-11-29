import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TransferBudgetActionComponent } from './transfer-budget-action.component';

describe('TransferBudgetActionComponent', () => {
  let component: TransferBudgetActionComponent;
  let fixture: ComponentFixture<TransferBudgetActionComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ TransferBudgetActionComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(TransferBudgetActionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
