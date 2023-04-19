import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BadgeBoardComponent } from './badge-board.component';

describe('BadgeBoardComponent', () => {
  let component: BadgeBoardComponent;
  let fixture: ComponentFixture<BadgeBoardComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ BadgeBoardComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(BadgeBoardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
