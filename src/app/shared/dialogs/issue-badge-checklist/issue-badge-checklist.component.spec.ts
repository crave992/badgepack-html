import { ComponentFixture, TestBed } from '@angular/core/testing';

import { IssueBadgeChecklistComponent } from './issue-badge-checklist.component';

describe('IssueBadgeChecklistComponent', () => {
  let component: IssueBadgeChecklistComponent;
  let fixture: ComponentFixture<IssueBadgeChecklistComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ IssueBadgeChecklistComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(IssueBadgeChecklistComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
