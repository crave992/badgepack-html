import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ReportBadgesClaimedComponent } from './report-badges-claimed.component';

describe('ReportBadgesClaimedComponent', () => {
  let component: ReportBadgesClaimedComponent;
  let fixture: ComponentFixture<ReportBadgesClaimedComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ReportBadgesClaimedComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ReportBadgesClaimedComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
