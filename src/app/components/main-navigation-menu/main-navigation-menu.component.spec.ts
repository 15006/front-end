import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MainNavigationMenuComponent } from './main-navigation-menu.component';

describe('MainNavigationMenuComponent', () => {
  let component: MainNavigationMenuComponent;
  let fixture: ComponentFixture<MainNavigationMenuComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ MainNavigationMenuComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(MainNavigationMenuComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
