import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BadgeProfileComponent } from './badge-profile.component';

describe('BadgeProfileComponent', () => {
  let component: BadgeProfileComponent;
  let fixture: ComponentFixture<BadgeProfileComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ BadgeProfileComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(BadgeProfileComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
