import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DashboardTabAcquiredComponent } from './dashboard-tab-acquired.component';

describe('DashboardTabAcquiredComponent', () => {
  let component: DashboardTabAcquiredComponent;
  let fixture: ComponentFixture<DashboardTabAcquiredComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ DashboardTabAcquiredComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(DashboardTabAcquiredComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
