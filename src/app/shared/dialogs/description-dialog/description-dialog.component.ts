import { Component, Inject, OnInit, Output } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Select, Store } from '@ngxs/store';
import { AssignChecklistDefaults } from 'app/shared/models/assign-checklist.model';
import { BadgeService } from 'app/shared/services/badge.service';
import { CreateAssignCheckList, UpdateAssignedCheckList } from 'app/shared/states/assign-checklist.actions';
import { EventEmitter } from 'events';
import { Observable, Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { SharedConfirmationDialogComponent } from '../shared-confirmation-dialog/shared-confirmation-dialog.component';
import { DatePipe } from '@angular/common';
import { BadgeAssigned } from 'app/shared/models/badge.model';
import { AssignBadge, UpdateAssignedBadge } from 'app/shared/states/badge.actions';
import { SharedService } from 'app/shared/services/shared.service';
import { AuthState } from 'app/shared/states/auth.state';
import { DashboardPartials } from 'app/shared/states/dashboard.actions';
import { DashboardState } from 'app/shared/states/dashboard.state';

export interface DialogData {
  description?: any;
  checklists?: any;
  meta?: any;
  type?: string;
  confirmText?: string | null;
  cancelText?: string | null;
  badgeId?: string | null;
  badgeCreator?: string | null;
}

@Component({
  selector: 'app-description-dialog',
  templateUrl: './description-dialog.component.html',
  styleUrls: ['./description-dialog.component.scss']
})
export class DescriptionDialogComponent implements OnInit {
  description = '';
  type = '';
  checklists = '';
  confirmText = '';
  cancelText = '';
  badgeId = '';
  badgeCreator = '';

  meta: any;
  availableBadges: any;
  partialBadges: any;
  dialogComponent: any;
  timeNow: any;

  auth: any;
  assignChecklistForm: FormGroup;
  assignedBadgesForm: FormGroup;

  checkedItems: string[] = [];
  updatedPendingCheckedItems: string[] = [];
  width: string;
  available = [];
  partials = [];

  panelOpenState: boolean = false;

  customCollapsedHeight: string = '65px';
  customExpandedHeight: string = '65px';

  pipe = new DatePipe('en-US');
  dateNow = new Date();

  @Select(AuthState.auth) auth$: Observable<any>;
  @Select(DashboardState.partials) partials$: Observable<any>;
  
  private _unsubscribeAll: Subject<any>;

  constructor(
    @Inject(MAT_DIALOG_DATA) private _data: DialogData,
    private _dialogRef: MatDialogRef<DescriptionDialogComponent>,
    private _dialog: MatDialog,
    private _formBuilder: FormBuilder,
    private _store: Store,
    private _badgeService: BadgeService,
    private _dataService: SharedService
  ) {
    this.description = _data.description || '';
    this.type = _data.type || '';
    this.checklists = _data.checklists || '';
    this.meta = _data.meta || '';
    this.confirmText = _data.confirmText || 'Confirm';
    this.cancelText = _data.cancelText || 'Close';
    this.badgeId = _data.badgeId || '';
    this.badgeCreator = _data.badgeCreator || '';
    this._unsubscribeAll = new Subject();
  }

  ngOnInit(): void {
    if (this.type === 'pending') {
      this._store.dispatch(new DashboardPartials('partial', { page: 1 }, null));

      this.partials$
        .pipe(takeUntil(this._unsubscribeAll))
        .subscribe((partials) => {
          this.partials = partials;
          this.partials.forEach(element => {
            element.user_checklist.forEach(checklist => {
              if (checklist.is_checked === 'yes') {
                this.checkedItems.push(checklist.checklist_id);
              }
            });
          });
        });
    }

    let hour = this.dateNow.getHours() < 10 ? '0' : '';
    hour = hour + this.dateNow.getHours();
    let minutes = this.dateNow.getMinutes() < 10 ? '0' : '';
    minutes = minutes + this.dateNow.getMinutes();
    const time = hour + ':' + minutes;

    this.auth$
      .pipe(takeUntil(this._unsubscribeAll))
      .subscribe((auth) => {
        this.auth = auth;
      });

    this.tConvert(time);
    this.initAssignedChecklistForm();
    this.initAssignedBadgeForm();
  }

  tConvert(time): any {
    time = time
      .toString()
      .match(/^([01]\d|2[0-3])(:)([0-5]\d)(:[0-5]\d)?$/) || [time];

    if (time.length > 1) {
      time = time.slice(1);
      time[5] = +time[0] < 12 ? 'AM' : 'PM';
      time[0] = +time[0] % 12 || 12;
    }

    this.timeNow = time[0] + time[1] + time[2] + ' ' + time[5];
  }

  initAssignedBadgeForm(): void {
    this.assignedBadgesForm = this._formBuilder.group({
      badge_id: [BadgeAssigned.badge_id],
      user_ids: [BadgeAssigned.user_ids, [Validators.required]],
      meta: this._formBuilder.group({
        acquired_date: [
          new Date(),
          [Validators.required]
        ],
        acquired_time: [
          BadgeAssigned.meta.acquired_time,
          [Validators.required]
        ],
      }),
      remarks: [BadgeAssigned.remarks]
    });
  }

  initAssignedChecklistForm(): void {
    this.assignChecklistForm = this._formBuilder.group({
      badge_id: [AssignChecklistDefaults.badge_id, [Validators.required]],
      user_ids: [AssignChecklistDefaults.user_ids, [Validators.required]],
      checklist_ids: [AssignChecklistDefaults.checklist_ids],
    });
  }

  onOpenDialog(description, checklist, type = null, action, checklists = null, event: Event = null): void {
    if (this.type === 'available') {
      this.checkedItems.push(checklist.checklist_id);
    }

    let dialogRef;
    let dialogData = {};

    switch (action) {
      case 'details':
        dialogData = {
          description,
          type,
          checklists: checklist,
          action,
          confirmText: '',
          cancelText: ''
        };
        this.width = '1200px';
        this.dialogComponent = DescriptionDialogComponent;
        break;
      case 'checklist':
        var title;
        if (this.type === 'available') {
          title = checklist.title;
          dialogData = {
            type: 'warning',
            title: 'Are you sure?',
            body: `Have you completed ` + title + '?',
            action,
            confirmText: 'Yes',
            cancelText: 'No'
          };
        }

        if (this.type === 'pending') {
          title = checklist.checklist_info.title;
          if (!this.checkedItems.includes(checklist?.checklist_id)) {
            dialogData = {
              type: 'warning',
              title: 'Are you sure?',
              body: `Have you completed ` + title + '?',
              action,
              confirmText: 'Yes',
              cancelText: 'No'
            };
          } else {
            dialogData = {
              type: 'warning',
              title: 'Notice',
              body: `You are not allowed to select this item. If you want to update this item, Please contact ` + this.badgeCreator,
              confirmText: '',
              cancelText: 'Close'
            };
          }
        }

        this.width = '800px';
        this.dialogComponent = SharedConfirmationDialogComponent;
        this.checkedItems.push(checklist.checklist_id);
        break;
    }

    dialogRef = this._dialog.open(this.dialogComponent, {
      width: this.width,
      data: dialogData,
    });

    dialogRef
      .afterClosed()
      .pipe(takeUntil(this._unsubscribeAll))
      .subscribe((result) => {

        if (result.is_save !== 'undefined' && result.is_save) {
          switch (action) {
            case 'checklist':
              if (this.type === 'available') {
                this.assignChecklistForm.controls['badge_id'].setValue(checklist.badge_id);
                this.assignChecklistForm.controls['checklist_ids'].setValue([checklist.id]);
                this.assignChecklistForm.controls['user_ids'].setValue([this.auth.id]);

                const assignChecklistFormValues = Object.assign({}, this.assignChecklistForm.getRawValue());
                this._store.dispatch(new CreateAssignCheckList(assignChecklistFormValues));

                setTimeout(() => {
                  var is_update = false;

                  if (checklists.length <= 1) {
                    is_update = true;
                  }

                  result = { 'isUpdate': is_update, 'user_ids': '', 'is_save': true };

                  setTimeout(() => {
                    this.onIssue(result, checklist);
                    this._dialogRef.close(true);
                  }, 500);
                }, 500);
                this.checkedItems = [];
              }

              if (this.type === 'pending') {
                if (checklist.is_checked === 'no') {

                  const formValues = {
                    'badge_id': checklist.badge_id,
                    'checklist_ids': [checklist.checklist_id],
                    'user_id': this.auth.id,
                    'claim_id': checklist.claim_id,
                    'unchecked_checklist_ids': []
                  }

                  const assignChecklistFormValues = Object.assign({}, formValues);
                  setTimeout(() => {
                    this._store.dispatch(new UpdateAssignedCheckList(checklist.badge_id, assignChecklistFormValues));
                  }, 100);

                  this.checkedItems.push(checklist.checklist_id);

                  setTimeout(() => {
                    this._badgeService.myPartialBadges(null, null).subscribe(
                      (response: any) => {
                        var total_tick_checklist = 0;
                        var total_checklist = 0;
                        var completeBadge = false;

                        response.data.forEach(element => {
                          if (checklist.claim_id === element.claim_id.toString()) {
                            element.user_checklist.forEach(user_checklist => {
                              if (user_checklist.deleted_at === null) {
                                total_checklist++;
                                if (user_checklist.is_checked === 'yes') {
                                  total_tick_checklist++;
                                }
                              }
                            });
                          }
                        });

                        var isUpdate = false;
                        var progress = 'save_progress';

                        if (total_checklist === total_tick_checklist) {
                          isUpdate = true;
                          progress = 'issueBadge';
                          completeBadge = true;
                        }

                        var result = {
                          'isUpdate': isUpdate,
                          'user_ids': [this.auth.id],
                          'save_progress': progress,
                          'claim_id': checklist.claim_id,
                          'is_save': true
                        }

                        setTimeout(() => {
                          if (completeBadge) {
                            this.onIssue(result, checklist);
                            this._dialogRef.close(true);
                          }
                        }, 500);
                      },
                    );
                  }, 500);
                }
              }
              break;
          }
        } else {
          if (this.type === 'available') {
            this._badgeService.getUserAvailableBadges(null, null).subscribe(
              (response: any) => {
                this.availableBadges = response.data
                this.availableBadges.forEach(element => {
                  if (element.id === this.badgeId) {
                    this.checklists = element.checklist;
                  }
                });
              },
            );
          }

          if (this.type === 'pending' && event) {
            var index = this.checkedItems.indexOf(checklist.checklist_id);
            if (index !== -1) {
              this.checkedItems.splice(index, 1);
            }
          }
        }
      });
  }

  onIssue(result = null, checklist = null): void {
    const fixDateFormat = this.pipe.transform(this.dateNow, 'yyyy-MM-dd');
    this.assignedBadgesForm.patchValue({
      badge_id: checklist.badge_id,
      user_ids: [this.auth.id],
      meta: {
        acquired_date: fixDateFormat,
        acquired_time: this.timeNow
      }
    });

    if (
      (result !== null
        && !result.isUpdate)
      && (checklist
      )) {
      this.assignedBadgesForm.get("meta.acquired_date").clearValidators();
      this.assignedBadgesForm.patchValue({ meta: { acquired_date: "" } });
      this.assignedBadgesForm.updateValueAndValidity();
    }

    if (this.assignedBadgesForm.valid) {
      const badgeFormValues = Object.assign({}, this.assignedBadgesForm.value);

      if (badgeFormValues) {
        if (result === null || result.save_progress !== 'issueBadge') {
          this._store.dispatch(new AssignBadge(badgeFormValues));
        } else {
          this._store.dispatch(
            new UpdateAssignedBadge(result.claim_id, badgeFormValues, 'issueBadge')
          );
        }
      }

      this.assignedBadgesForm.patchValue({
        user_ids: null,
        remarks: null,
        meta: {
          acquired_date: this.dateNow,
          acquired_time: this.timeNow,
          date_now: this.dateNow,
        },
      });

      if (this.type === 'available') {
        setTimeout(() => {
          this._badgeService.myPartialBadges(null, null).subscribe(
            (response: any) => {
              response.data.forEach(element => {
                element.user_checklist.forEach(checklist => {
                  if (checklist.is_checked === 'yes') {
                    this.updatedPendingCheckedItems.push(checklist.checklist_id);
                  }
                });
              });

              this._dataService.updateDataPending(
                response.data,
                this.updatedPendingCheckedItems,
                response.data.length
              );
            },
          );
        }, 500);

        setTimeout(() => {
          this._badgeService.getUserAcquiredBadges(null, null).subscribe(
            (response: any) => {
              this._dataService.updateDataAcquired(
                response.data.badges,
                response.data.badges.length
              );
            },
          );
        }, 700);
      }

      if (this.type === 'pending') {
        setTimeout(() => {
          this._badgeService.getUserAcquiredBadges(null, null).subscribe(
            (response: any) => {
              this._dataService.updateDataAcquired(
                response.data.badges,
                response.data.badges.length
              );
            },
          );
        }, 500);
      }
    }
  }

  deselectChecklistMessage(isChecked, checklist, checklists) {
    if (isChecked) {
      this.onOpenDialog(null, checklist, null, 'checklist', checklists, null);
    }
  }
}
