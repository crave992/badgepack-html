import { Component, OnInit, AfterViewInit, Inject, AfterContentInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { AssignChecklistDefaults } from 'app/shared/models/assign-checklist.model';
import { CheckList } from 'app/shared/models/checkList.model';
import { CheckListService } from 'app/shared/services/check-list.service';
import { CreateAssignCheckList } from 'app/shared/states/assign-checklist.actions';
import { Store } from '@ngxs/store';
import { BadgeService } from 'app/shared/services/badge.service';
import { SharedConfirmationDialogComponent } from '../shared-confirmation-dialog/shared-confirmation-dialog.component';
import { MatCheckboxChange } from '@angular/material/checkbox';
import { takeUntil } from 'rxjs/operators';
import { Subject } from 'rxjs';

export interface DialogData {
  confirmText?: string | null;
  cancelText?: string | null;
  badgeId?: string | null;
  user_ids?: any | null;
}

@Component({
  selector: 'app-issue-badge-checklist',
  templateUrl: './issue-badge-checklist.component.html',
  styleUrls: ['./issue-badge-checklist.component.scss']
})

export class IssueBadgeChecklistComponent implements OnInit, AfterContentInit {
  isUpdate = false;
  isSave = false;
  isTargetAudience: boolean;

  confirmText = '';
  cancelText = '';
  badgeId = '';
  user_ids = [];
  checklist = [];

  data: any[];
  users: any[];
  dialogComponent: any;
  prerequisiteBadges = [];
  prereqBadgeClaim = [];

  width: string;

  checkList: CheckList[];
  checklist_ids = [];

  assignChecklistForm: FormGroup;

  tableColumns = [
    'title',
    'description',
    'type',
  ];

  isDisabled: boolean;
  private _unsubscribeAll: Subject<any>;

  constructor(
    @Inject(MAT_DIALOG_DATA) private _data: DialogData,
    private _dialogRef: MatDialogRef<IssueBadgeChecklistComponent>,
    private _checkListService: CheckListService,
    private _formBuilder: FormBuilder,
    private _store: Store,
    private _badgeService: BadgeService,
    private _dialog: MatDialog,
  ) {
    this.confirmText = _data.confirmText || 'Confirm';
    this.cancelText = _data.cancelText || 'Cancel';
    this.badgeId = _data.badgeId || '';
    this.user_ids = _data.user_ids || [];
    this.assignChecklistForm = this._formBuilder.group({});
    this._unsubscribeAll = new Subject();
  }

  ngOnInit(): void {
    this.initAssignedBadgeForm();
    this._checkListService.listChecklist(this.badgeId)
      .subscribe((checkList: any) => {
        this.checkList = checkList.data;
      });

    this._badgeService.getUseraBadgePrerequisites({ user_ids: this.user_ids }, this.badgeId)
      .subscribe((prerequisite: any) => {
        this.prerequisiteBadges = prerequisite.data;
        this.checklist = this.prerequisiteBadges['earned'];
        if (this.prerequisiteBadges['earned'].length) {
          this.isDisabled = false;
        }
      });

    this.getSelectedChecklistIds();
  }

  initAssignedBadgeForm(): void {
    this.assignChecklistForm = this._formBuilder.group({
      badge_id: [AssignChecklistDefaults.badge_id, [Validators.required]],
      user_ids: [AssignChecklistDefaults.user_ids, [Validators.required]],
      checklist_ids: [AssignChecklistDefaults.checklist_ids],
    });
  }

  onCheckSelectedCheckboxes(data = null, ob: MatCheckboxChange = null): void {
    var count = this.checkList?.length;
    var checked = 0;
    var checklist = document.getElementById("checklist");
    var checklists = checklist.getElementsByTagName("input");
    var prereqId = checklist.getElementsByTagName("mat-checkbox");
    var user_ids = [];
    var name;
    this.isTargetAudience = true;

    if (data) {
      var title = data.title;
      var badgePrereqId = data.badge_prerequisite_id ?
        data.badge_prerequisite_id : null;
    }

    for (var i = 0; i < checklists.length; i++) {
      if (checklists[i].checked) {
        checked++;

        if (
          prereqId[i].getAttribute('prereq-id') === data.badge_prerequisite_id
          && data.badge_prerequisite_id
        ) {
          if (badgePrereqId) {
            this._badgeService.assignUser(badgePrereqId)
              .subscribe((res: any) => {
                this.users = res.prereq_users;                                                                                                                            

                this.users.forEach(user => {
                  user_ids.push(user.id);
                });

                this.user_ids.forEach(id => {
                  if (!user_ids.includes(id)) {
                    this.isTargetAudience = false;
                  }
                });

                var name = this.user_ids.length > 1 ? 'Some users are' : 'The current user is';

                if (!this.isTargetAudience) {
                  this.onOpenDialog('notice', name, title);
                }
              });
          }
        }
      }
    }
    this.isUpdate = checked === count ? true : false;
    this.isDisabled = checked >= 1 ? false : true;

    if (data !== null && data?.type === 'Badge Prerequisite') {
      setTimeout(() => {
        if (
          this.prerequisiteBadges['earned'] !== undefined
          && this.prerequisiteBadges['earned'].length
        ) {
          this.prerequisiteBadges['earned'].push(data.badge_prerequisite_id);
        }
      }, 200);

      if (this.prerequisiteBadges['not_all_earned'] !== undefined) {
        if (this.prerequisiteBadges['not_all_earned'].indexOf(data.badge_prerequisite_id) !== -1) {
          if (ob.checked) {
            this.onOpenDialog('notice_badge_prerequisite',
              data.title,
              'Notice',
              data.badge_prerequisite_id
            );
          }
        }
      }

    }
  }

  getSelectedChecklistIds() {
    var checklist = document.getElementById("checklist");
    var checklists = checklist.getElementsByTagName("input");
    var checklist_id = checklist.getElementsByTagName("mat-checkbox");
    var checklist_ids = [];

    for (var i = 0; i < checklists.length; i++) {
      if (checklists[i].checked) {
        checklist_ids.push(checklist_id[i].getAttribute('checklist-id'));
      }
    }

    return checklist_ids
  }

  onSave(): void {
    this.isSave = true;
    this.assignChecklistForm.controls['badge_id'].setValue(this.badgeId);
    this.assignChecklistForm.controls['checklist_ids'].setValue(this.getSelectedChecklistIds());
    this.assignChecklistForm.controls['user_ids'].setValue(this.user_ids);

    const assignChecklistFormValues = Object.assign({}, this.assignChecklistForm.getRawValue());
    this._store.dispatch(new CreateAssignCheckList(assignChecklistFormValues));
    this._dialogRef.close({ 'isUpdate': this.isUpdate, 'user_ids': '', 'is_save': this.isSave });
  }

  ngAfterContentInit() {
    setTimeout(() => {
      this.onCheckSelectedCheckboxes(this.checkList);
    }, 400);
  }

  onOpenDialog(action, name = null, title = null, prereqID = null): void {
    let dialogRef;
    let dialogData = {};
    switch (action) {
      case 'notice':
        dialogData = {
          type: 'warning',
          title: 'Notice',
          body: name + ` not a target audience of ` + title,
          confirmText: '',
          cancelText: 'Close'
        };
        this.width = '600px';
        this.dialogComponent = SharedConfirmationDialogComponent;
        break;
      case 'notice_badge_prerequisite':
        dialogData = {
          type: 'warning',
          title: 'Notice',
          category: 'badge prerequisite',
          body: `Some users have already earned the badge ` + name + `, 
            do you wish to proceed? This will have no effect on the users 
            that have already earned the pre-requisite badge.`,
          confirmText: 'Yes',
          cancelText: 'Close'
        };
        this.width = '600px';
        this.dialogComponent = SharedConfirmationDialogComponent;
        break;
    }

    dialogRef = this._dialog.open(this.dialogComponent, {
      width: this.width,
      data: dialogData
    });

    dialogRef
      .afterClosed()
      .pipe(takeUntil(this._unsubscribeAll))
      .subscribe((result) => {
        switch (action) {
          case 'notice_badge_prerequisite':
            if (!result) {
              setTimeout(() => {
                const index = this.prerequisiteBadges['earned'].indexOf(prereqID);
                if (index > -1) {
                  this.prerequisiteBadges['earned'].splice(index, 1);
                }
              }, 200);
            }
            break;
        }
      });
  }
}
