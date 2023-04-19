import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ChecklistDialogComponent } from './checklist-dialog.component';

describe('ChecklistDialogComponent', () => {
  let component: ChecklistDialogComponent;
  let fixture: ComponentFixture<ChecklistDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ChecklistDialogComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ChecklistDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
