import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DashboardTabAvailableComponent } from './dashboard-tab-available.component';

describe('DashboardTabAvailableComponent', () => {
  let component: DashboardTabAvailableComponent;
  let fixture: ComponentFixture<DashboardTabAvailableComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ DashboardTabAvailableComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(DashboardTabAvailableComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
