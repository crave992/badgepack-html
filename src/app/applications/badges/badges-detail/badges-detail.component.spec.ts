import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BadgesDetailComponent } from './badges-detail.component';

describe('BadgesDetailComponent', () => {
  let component: BadgesDetailComponent;
  let fixture: ComponentFixture<BadgesDetailComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ BadgesDetailComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(BadgesDetailComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
