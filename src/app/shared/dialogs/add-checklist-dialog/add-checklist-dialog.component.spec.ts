import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AddChecklistDialogComponent } from './add-checklist-dialog.component';

describe('AddChecklistDialogComponent', () => {
  let component: AddChecklistDialogComponent;
  let fixture: ComponentFixture<AddChecklistDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AddChecklistDialogComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(AddChecklistDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
