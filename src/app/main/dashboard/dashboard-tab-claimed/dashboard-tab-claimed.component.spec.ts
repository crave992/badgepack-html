import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { DashboardTabClaimedComponent } from './dashboard-tab-claimed.component';

describe('DashboardTabClaimedComponent', () => {
  let component: DashboardTabClaimedComponent;
  let fixture: ComponentFixture<DashboardTabClaimedComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ DashboardTabClaimedComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DashboardTabClaimedComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
