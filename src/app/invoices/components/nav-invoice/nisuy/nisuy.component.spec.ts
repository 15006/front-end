import { ComponentFixture, TestBed } from '@angular/core/testing';

import { NisuyComponent } from './nisuy.component';

describe('NisuyComponent', () => {
  let component: NisuyComponent;
  let fixture: ComponentFixture<NisuyComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ NisuyComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(NisuyComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
