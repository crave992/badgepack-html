import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BoardsListViewComponent } from './boards-list-view.component';

describe('BoardsListViewComponent', () => {
  let component: BoardsListViewComponent;
  let fixture: ComponentFixture<BoardsListViewComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ BoardsListViewComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(BoardsListViewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
