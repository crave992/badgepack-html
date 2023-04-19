import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ProgressChecklistDialogComponent } from './progress-checklist-dialog.component';

describe('ProgressChecklistDialogComponent', () => {
  let component: ProgressChecklistDialogComponent;
  let fixture: ComponentFixture<ProgressChecklistDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ProgressChecklistDialogComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ProgressChecklistDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
