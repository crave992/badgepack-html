import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { DashboardTabExpiredComponent } from './dashboard-tab-expired.component';

describe('DashboardTabExpiredComponent', () => {
  let component: DashboardTabExpiredComponent;
  let fixture: ComponentFixture<DashboardTabExpiredComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ DashboardTabExpiredComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DashboardTabExpiredComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
