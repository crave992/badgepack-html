import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BadgesFormChecklistComponent } from './badges-form-checklist.component';

describe('BadgesFormChecklistComponent', () => {
  let component: BadgesFormChecklistComponent;
  let fixture: ComponentFixture<BadgesFormChecklistComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ BadgesFormChecklistComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(BadgesFormChecklistComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
