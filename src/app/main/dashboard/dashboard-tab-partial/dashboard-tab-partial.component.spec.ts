import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DashboardTabPartialComponent } from './dashboard-tab-partial.component';

describe('DashboardTabPartialComponent', () => {
  let component: DashboardTabPartialComponent;
  let fixture: ComponentFixture<DashboardTabPartialComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ DashboardTabPartialComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(DashboardTabPartialComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
