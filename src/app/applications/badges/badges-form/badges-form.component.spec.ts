import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { BadgesFormComponent } from './badges-form.component';

describe('BadgesFormComponent', () => {
  let component: BadgesFormComponent;
  let fixture: ComponentFixture<BadgesFormComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ BadgesFormComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(BadgesFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
