import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BoardsItemViewComponent } from './boards-item-view.component';

describe('BoardsItemViewComponent', () => {
  let component: BoardsItemViewComponent;
  let fixture: ComponentFixture<BoardsItemViewComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ BoardsItemViewComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(BoardsItemViewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
