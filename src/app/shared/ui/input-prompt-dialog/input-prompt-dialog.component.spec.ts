import { ComponentFixture, TestBed } from '@angular/core/testing';

import { InputPromptDialogComponent } from './input-prompt-dialog.component';

describe('InputPromptDialogComponent', () => {
  let component: InputPromptDialogComponent;
  let fixture: ComponentFixture<InputPromptDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ InputPromptDialogComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(InputPromptDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
