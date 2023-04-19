import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BadgesFormAssignComponent } from './badges-form-assign.component';

describe('BadgesFormAssignComponent', () => {
  let component: BadgesFormAssignComponent;
  let fixture: ComponentFixture<BadgesFormAssignComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ BadgesFormAssignComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(BadgesFormAssignComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
