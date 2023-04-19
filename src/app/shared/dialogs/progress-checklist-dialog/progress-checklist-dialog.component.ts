import { Component, OnInit, Inject, AfterContentInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { CheckList } from 'app/shared/models/checkList.model';
import { CheckListService } from 'app/shared/services/check-list.service';
import { UpdateAssignedCheckList } from 'app/shared/states/assign-checklist.actions';
import { Select, Store } from '@ngxs/store';
import { BadgeAssigned } from 'app/shared/models/badge.model';
import { BadgeService } from 'app/shared/services/badge.service';
import { AuthState } from 'app/shared/states/auth.state';
import { Observable, Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { formatDate } from '@angular/common';
import { stubFalse } from 'lodash';
import { SharedConfirmationDialogComponent } from '../shared-confirmation-dialog/shared-confirmation-dialog.component';

export interface DialogData {
  confirmText?: string | null;
  cancelText?: string | null;
  badgeId?: string | null;
  userId?: any | null;
  id?: string | null;
  badgeValue: any;
  claimId?: string | null;
  dateNow?: any | null;
}
@Component({
  selector: 'app-progress-checklist-dialog',
  templateUrl: './progress-checklist-dialog.component.html',
  styleUrls: ['./progress-checklist-dialog.component.scss']
})
export class ProgressChecklistDialogComponent implements OnInit, AfterContentInit {

  isUpdate = false;
  isSave = false;
  isTargetAudience: boolean;
  isDisabled: boolean;
  isIssued: string;
  timeNow: any;

  confirmText = '';
  cancelText = '';
  badgeId = '';
  userId = '';
  id = '';
  badgeValue = '';
  claimId = '';
  dateNow;
  width: string;

  userChecklist = [];
  checklist_ids = [];
  uncheckChecklistIds = [];
  checkList: CheckList[];
  users: any[];
  dialogComponent: any;

  auth;

  assignChecklistForm: FormGroup;
  assignedBadgesForm: FormGroup;

  tableColumns = [
    'title',
    'issued_from',
    'issuance_date',
    'issued_by'
  ];

  @Select(AuthState.auth) auth$: Observable<any>;
  private _unsubscribeAll: Subject<any>;

  constructor(
    @Inject(MAT_DIALOG_DATA) private _data: DialogData,
    private _dialogRef: MatDialogRef<ProgressChecklistDialogComponent>,
    private _badgeService: BadgeService,
    private _checkListService: CheckListService,
    private _formBuilder: FormBuilder,
    private _store: Store,
    private _dialog: MatDialog,
  ) {
    this.confirmText = _data.confirmText || 'Confirm';
    this.cancelText = _data.cancelText || 'Cancel';
    this.badgeId = _data.badgeId || '';
    this.userId = _data.userId || [];
    this.id = _data.id || '';
    this.badgeValue = _data.badgeValue || '';
    this.claimId = _data.claimId;
    this.dateNow = _data.dateNow;
    this.assignChecklistForm = this._formBuilder.group({});
    this._unsubscribeAll = new Subject();
  }

  ngOnInit(): void {

    this.auth$
      .pipe(takeUntil(this._unsubscribeAll))
      .subscribe((auth) => {
        if (auth) {
          this.auth = auth;
        }
      });

    this._badgeService.getUserAssignedChecklist(this.id, this.badgeId)
      .subscribe((userChecklist: any) => {
        this.userChecklist = userChecklist.data;
        this.isIssued = userChecklist.status;
      });

    this._checkListService.listChecklist(this.badgeId)
      .subscribe((checkList: any) => {
        this.checkList = checkList.data;
      });

    let hour = this.dateNow.getHours() < 10 ? '0' : '';
    hour = hour + this.dateNow.getHours();
    let minutes = this.dateNow.getMinutes() < 10 ? '0' : '';
    minutes = minutes + this.dateNow.getMinutes();
    const time = hour + ':' + minutes;

    this.tConvert(time);

    this.initAssignedBadgeForm();
    this.getSelectedChecklistIds();
  }

  initAssignedBadgeForm(): void {
    this.assignedBadgesForm = this._formBuilder.group({
      badge_id: [BadgeAssigned.badge_id],
      user_ids: [BadgeAssigned.user_ids, [Validators.required]],
      meta: this._formBuilder.group({
        acquired_date: [
          new Date(),
          [Validators.required],
        ],
        acquired_time: [
          BadgeAssigned.meta.acquired_time,
          [Validators.required],
        ],
      }),
      remarks: [BadgeAssigned.remarks]
    });
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

  onCheckSelectedCheckboxes(id = null): void {
    var count = this.checkList?.length;
    var checked = 0;
    var checklist = document.getElementById("checklist");
    var checklists = checklist.getElementsByTagName("input");

    for (var i = 0; i < checklists.length; i++) {
      if (checklists[i].checked) {
        checked++;
      }
    }

    if (this.userChecklist) {
      this.userChecklist.forEach(checklist => {
        if (checklist['id'] === id) {
          checklist['modified'] = true;
          checklist['meta'].application = ""

          if (checklist['tick'] === 'yes') {
            checklist['tick'] = 'no';
          } else {
            if (!checklist['tick']) {
              checklist['meta'].is_manually_ticked = 'yes';
              checklist['tick'] = 'yes';

              if (checklist['is_checked'] === 'yes') {
                checklist['tick'] = 'no';
              }
            } else {
              checklist['full_date'] = null;
              checklist['date_now'] = formatDate(new Date(), 'yyyy-MM-dd', 'en');
              checklist['time_now'] = this.timeNow;
              checklist['tick'] = 'yes';
            }
          }
        }
      });
    }

    this.isUpdate = checked === count ? true : false;
    this.isDisabled = id === null ? true : false;;
  }

  getSelectedChecklistIds() {
    var checklistIds = [];
    this.uncheckChecklistIds = [];

    var checklistItems = this.userChecklist.filter(function (el) {
      return el.modified === true && el.tick === 'yes';
    });

    var uncheckedChecklistItems = this.userChecklist.filter(function (el) {
      return el.modified === true && el.tick === 'no';
    });

    checklistItems.forEach(item => {
      checklistIds.push(item.checklist_id);
    });

    uncheckedChecklistItems.forEach(item => {
      this.uncheckChecklistIds.push(item.checklist_id);
    });

    return checklistIds
  }

  save(action = null): void {
    this.isSave = true;

    const formValues = {
      'badge_id': this.badgeId,
      'checklist_ids': this.getSelectedChecklistIds(),
      'unchecked_checklist_ids': this.uncheckChecklistIds,
      'user_id': this.userId,
      'claim_id': this.claimId
    }

    const assignChecklistFormValues = Object.assign({}, formValues);

    this._store.dispatch(new UpdateAssignedCheckList(this.badgeId, assignChecklistFormValues));

    this._dialogRef.close({
      'isUpdate': this.isUpdate,
      'user_ids': this.userId,
      'save_progress': action,
      'claim_id': this.claimId,
      'is_save': this.isSave
    });
  }

  ngAfterContentInit() {
    this.onCheckSelectedCheckboxes();
  }

  onGetUsers(data): any {
    var badgePrereqId = data.checklist.badge_prerequisite_id;
    var userId = data.user.id;
    var title = data.checklist.title;
    var tick = data.tick

    if (tick === 'yes') {
      this.isTargetAudience = false;
      if (badgePrereqId) {
        this._badgeService.assignUser(badgePrereqId)
          .subscribe((res: any) => {
            this.users = res.data;

            var user = this.users.find(function (value) {
              return value.id === userId;
            });

            this.isTargetAudience = user ? true : false;

            if (!this.isTargetAudience) {
              this.onOpenDialogDelete('notice', title);
            }
          });
      }
    }
  }

  onOpenDialogDelete(action, title = null): void {
    let dialogRef;
    let dialogData = {};
    switch (action) {
      case 'notice':
        dialogData = {
          type: 'warning',
          title: 'Notice',
          body: `The current user is not a target audience of ` + title,
          confirmText: '',
          cancelText: 'Close'
        };
        this.width = '480px';
        this.dialogComponent = SharedConfirmationDialogComponent;
        break;
      case 'Badge Prerequisite':
        dialogData = {
          type: 'warning',
          title: 'Notice',
          body: `Cannot untick prerequisite badge from the checklist. 
              Please untick it via the ` + title + ` badge issuance page.`,
          confirmText: '',
          cancelText: 'Close'
        };
        this.width = '1000px';
        this.dialogComponent = SharedConfirmationDialogComponent;
        break;
    }

    dialogRef = this._dialog.open(this.dialogComponent, {
      width: this.width,
      data: dialogData
    });
  }
}
