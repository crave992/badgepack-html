import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { BadgesFormClaimedComponent } from './badges-form-claimed.component';

describe('BadgesFormClaimedComponent', () => {
  let component: BadgesFormClaimedComponent;
  let fixture: ComponentFixture<BadgesFormClaimedComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ BadgesFormClaimedComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(BadgesFormClaimedComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
