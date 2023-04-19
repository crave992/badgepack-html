import { Component, OnDestroy, OnInit, ElementRef, ViewChild, AfterViewInit, Input, ChangeDetectionStrategy } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { Subject, Observable } from 'rxjs';
import { takeUntil, map, startWith } from 'rxjs/operators';
import { ActivatedRoute, Params } from '@angular/router';
import { DatePipe } from '@angular/common';

import { MatTableDataSource } from '@angular/material/table';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort, Sort } from '@angular/material/sort';

import { fuseAnimations } from '@fuse/animations';

import { Store, Select } from '@ngxs/store';
import { DeleteAssignedBadge, UpdateAssignedBadge } from 'app/shared/states/badge.actions';
import { AssignBadge } from 'app/shared/states/badge.actions';
import { BadgeState } from 'app/shared/states/badge.state';
import { Badge, BadgeAssigned } from 'app/shared/models/badge.model';

import { GlobalService } from 'app/shared/services/global.service';

import { MatDialog } from '@angular/material/dialog';

import { MatAutocomplete, MatAutocompleteSelectedEvent } from '@angular/material/autocomplete';
import { GroupService } from 'app/shared/services/group.service';
import { UserService } from 'app/shared/services/user.service';
import { BadgeService } from 'app/shared/services/badge.service';

import * as moment from 'moment';
import { SharedConfirmationDialogComponent } from 'app/shared/dialogs/shared-confirmation-dialog/shared-confirmation-dialog.component';
import { IssueBadgeChecklistComponent } from 'app/shared/dialogs/issue-badge-checklist/issue-badge-checklist.component';
import { CheckList } from 'app/shared/models/checkList.model';
import { CheckListService } from 'app/shared/services/check-list.service';
import { ProgressChecklistDialogComponent } from 'app/shared/dialogs/progress-checklist-dialog/progress-checklist-dialog.component';
import { MatDatepickerInputEvent } from '@angular/material/datepicker';

@Component({
  selector: 'badges-form-claimed',
  templateUrl: './badges-form-claimed.component.html',
  styleUrls: ['./badges-form-claimed.component.scss'],
  animations: fuseAnimations,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class BadgesFormClaimedComponent
  implements OnInit, OnDestroy, AfterViewInit {
  badge: Badge;
  badgeAssignees = new MatTableDataSource([]);

  dialogComponent?: any;

  tableColumns = [
    'badgeId',
    'csid',
    'username',
    'app',
    'issued_at',
    'expiration',
    'issuer',
    'remark',
    'status',
    'options',
  ];

  @ViewChild('userInput') userInput: ElementRef<HTMLInputElement>;
  @ViewChild('userAuto') MatAutocomplete: MatAutocomplete;
  @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;
  @ViewChild(MatSort, { static: true }) sort: MatSort;

  userCtrl = new FormControl();

  @Input() users;
  @Input() hasChecklist;

  maxDate = new Date();
  width: string;
  isChecklist: string;
  isCheck: string;
  badgeUsers: any[];
  listUsers: any[];
  displayUsers: any[];
  userIds: any[];
  time: any;
  dialog: any;
  timeNow: any;
  claimList: any[];
  claimTable: any[];
  mainBadges: any[];
  checkList: CheckList[];

  currentChecklistCount: number;
  totalChecklist: number;

  visible = true;
  selectable = true;
  removable = true;
  hasAsterisk = false;
  isDisabled = false;
  isReadOnly: boolean;

  assignedBadgesForm: FormGroup;
  pipe = new DatePipe('en-US');
  dateNow = new Date();
  myControl = new FormControl();
  filteredUsers: Observable<string[]>;

  @Select(BadgeState.current) badge$: Observable<any>;

  private _unsubscribeAll: Subject<any>;

  constructor(
    private _badgeService: BadgeService,
    private _store: Store,
    private _formBuilder: FormBuilder,
    private _dialog: MatDialog,
    private _router: ActivatedRoute,
    private _checkListService: CheckListService
  ) {
    this.badgeUsers = [];
    this.listUsers = [];
    this.displayUsers = [];
    this.userIds = [];
    this.isChecklist = '';

    this._unsubscribeAll = new Subject();
    this.filteredUsers = this.userCtrl.valueChanges.pipe(
      startWith(null),
      map((user: string | null) => user ? this._filter(user) : this.users.slice()));
  }

  ngOnInit(): void {
    this.badge$
      .pipe(takeUntil(this._unsubscribeAll))
      .subscribe((badge) => {
        this.badge = badge;
        this.isChecklist = badge.checklist;
      });

    this._badgeService.getAssignedBadges(this._router.snapshot.params.id)
      .subscribe((badge: any) => {
        this.claimList = badge.data;

        this.badgeAssignees = new MatTableDataSource(this.claimList);
        this.badgeAssignees.paginator = this.paginator;
        this.badgeAssignees.sort = this.sort;
      });

    this._checkListService.listChecklist(this._router.snapshot.params.id)
      .subscribe((checklist: any) => {
        this.totalChecklist = checklist.data.length;
        this.checkList = checklist.data;
      });


    let hour = this.dateNow.getHours() < 10 ? '0' : '';
    hour = hour + this.dateNow.getHours();
    let minutes = this.dateNow.getMinutes() < 10 ? '0' : '';
    minutes = minutes + this.dateNow.getMinutes();
    const time = hour + ':' + minutes;

    this.tConvert(time);
    this.initAssignedBadgeForm();
    this.assignedBadgesForm.patchValue({
      meta: {
        acquired_date: this.dateNow,
        acquired_time: this.timeNow,
        date_now: this.dateNow
      },
    });
    this.filteredUsers = this.myControl.valueChanges.pipe(
      startWith(''),
      map(value => this._filter(value))
    );

    this.getUpdatedTable();

    this.isReadOnly = true;

    this._badgeService.getMainBadges(this._router.snapshot.params.id)
      .subscribe((badge: any) => {
        this.mainBadges = badge.data
      });
  }

  onIssue(result = null): void {
    const acquiredDate = (document.getElementById('getDate') as HTMLInputElement).value;
    const fixDateFormat = this.pipe.transform(acquiredDate, 'yyyy-MM-dd');

    this.assignedBadgesForm.patchValue({
      badge_id: this._router.snapshot.params.id,
      meta: {
        acquired_date: fixDateFormat,
        date_now: fixDateFormat
      }
    });

    if (
      (result !== null
        && !result.isUpdate)
      && (this.hasChecklist
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

        setTimeout(() => {
          this.getUsers();
          this.getUpdatedTable();
        }, 700);
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
      this.badgeUsers = null;
      this.badgeUsers = [];
      this.userIds = null;
      this.userIds = [];
      this.isReadOnly = true;
    }
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
        date_now: [
          new Date(),
          [Validators.required]
        ]
      }),
      remarks: [BadgeAssigned.remarks]
    });
  }

  getUpdatedTable(): void {
    if (this._router.snapshot.params.id) {
      this._badgeService.getAssignedBadges(this._router.snapshot.params.id)
        .subscribe((badge: any) => {
          this.badge = badge;
          this.claimList = badge.data;

          this.badgeAssignees = new MatTableDataSource(this.claimList);
          this.badgeAssignees.paginator = this.paginator;
          this.badgeAssignees.sort = this.sort;
        });
    }

    this._badgeService.getBadge(this._router.snapshot.params.id)
      .subscribe((badge: any) => {
        this.hasChecklist = badge.data.checklist;
      });
  }

  getUsers(): any {
    if (this._router.snapshot.params.id) {
      this._badgeService.assignUser(this._router.snapshot.params.id)
        .subscribe((res: any) => {
          this.users = res.data;
          this.displayUsers = res.data;
        });
    }
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

  removeUser(user: any): void {
    const index = this.badgeUsers.indexOf(user);

    if (index >= 0) {
      this.badgeUsers.splice(index, 1);
      this.userIds.splice(index, 1);

      this.assignedBadgesForm.patchValue({ user_ids: this.userIds });

      this._filterUsers('');
    }
  }

  selectedUser(event: MatAutocompleteSelectedEvent): void {
    this.badgeUsers.push(event.option.value);
    this.userIds.push(event.option.value.id);

    this.userInput.nativeElement.value = '';
    this.userCtrl.setValue('');
    this.assignedBadgesForm.patchValue({ user_ids: this.userIds });

    this._filterUsers('');
  }

  addUser(event): void {
    this.filteredUsers.pipe(takeUntil(this._unsubscribeAll)).subscribe((e) => { });
  }

  private _filterUsers(value: any): any[] {
    if (typeof value === 'string') {
      const filterValue = value.toLowerCase();
      if (this.users) {
        return (this.displayUsers = this.users.filter((user) => {
          if (user.id) {
            const sUser = this.badgeUsers.slice().find((u) => {
              return u.id === user.id;
            });

            if (
              user.name
              &&
              user.username
            ) {
              const userFullName = user.name.toLowerCase();
              const userUsername = user.username.toLowerCase();

              return (!sUser && (userUsername.indexOf(filterValue) >= 0 || userFullName.indexOf(filterValue) >= 0));
            } else if (user.name) {
              const userFullName = user.name.toLowerCase();

              return (!sUser && (userFullName.indexOf(filterValue) >= 0));
            } else if (user.username) {
              const userUsername = user.username.toLowerCase();

              return (!sUser && (userUsername.indexOf(filterValue) >= 0));
            } else {
              return [];
            }

          } else {
            return [];
          }
        }));
      }
    }

    return [];
  }

  private _filter(value: string): string[] {
    const filterValue = value.toLowerCase();

    return this.users.filter(user => user.toLowerCase().indexOf(filterValue) === 0);
  }

  onOpenDialogDelete(action, id, claimId = null): void {
    let dialogRef;
    let dialogData = {};
    switch (action) {
      case 'delete':
        var width = '400px';
        var mainBadgesList = `<ol>`;

        this.mainBadges.forEach(badge => {
          mainBadgesList += `<li> BG-` + badge.badge_id + ' ' + badge.name + `</li>`
        });

        mainBadgesList += `</ol>`;

        dialogData = {
          type: 'warning',
          title: 'Are you sure?',
          body: `Deleting this assigned badge will permanently remove it from the list.`,
          confirmText: '',
          cancelText: ''
        };

        if (this.mainBadges.length) {
          dialogData = {
            type: 'warning',
            title: 'Are you sure?',
            body: `This badge is a pre-requisite badge on the ff badge(s): 
              \nWould you like to proceed? \n` + mainBadgesList,
            content: this.mainBadges,
            confirmText: '',
            cancelText: ''
          };

          width = '600px;'
        }

        this.width = width;
        this.dialogComponent = SharedConfirmationDialogComponent;
        break;
      case 'showChecklist':
        dialogData = {
          type: 'warning',
          title: '',
          body: ``,
          user_ids: this.userIds,
          badgeId: this._router.snapshot.params.id,
          confirmText: 'Issue Badge',
          cancelText: 'Cancel'
        };
        this.width = '800px';
        this.dialogComponent = IssueBadgeChecklistComponent;
        break;
      case 'showProgress':
        const acquiredDate = (document.getElementById('getDate') as HTMLInputElement).value;
        dialogData = {
          type: 'warning',
          title: '',
          body: ``,
          fixDateFormat: this.pipe.transform(acquiredDate, 'yyyy-MM-dd'),
          badgeValue: this.assignedBadgesForm.value,
          claimId,
          userId: id,
          id,
          dateNow: this.dateNow,
          badgeId: this._router.snapshot.params.id,
          confirmText: 'Issue Badge',
          cancelText: 'Cancel'
        };
        this.width = '800px';
        this.dialogComponent = ProgressChecklistDialogComponent;
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
          case 'delete':
            if (this._router.snapshot.params.id) {
              if (result.is_save === true)
                this._store.dispatch(new DeleteAssignedBadge(id, this._router.snapshot.params.id));

              setTimeout(() => {
                this.getUsers();
                this.getUpdatedTable();
              }, 700);
            }
            break;
          default:
            setTimeout(() => {
              if (result?.is_save !== undefined && result?.is_save === true) {
                if (result.user_ids) {
                  this.userIds = [result.user_ids];
                  this.assignedBadgesForm.patchValue({ user_ids: this.userIds });
                }

                if (result.save_progress !== 'save_progress') {
                  this.onIssue(result);
                } else {
                  this.userIds = null;
                  this.userIds = [];
                  this.getUsers();
                  this.getUpdatedTable();
                }
              }

            }, 700);
        }
      });
  }

  refresh(): void {
    window.location.reload();
  }

  searchUser(event: Event): void {
    const filterValue = (event.target as HTMLInputElement).value;
    this.users.filter = filterValue.trim().toLowerCase();
  }

  ngAfterViewInit(): void {
    this.filteredUsers = this.userCtrl.valueChanges.pipe(
      startWith(''),
      map((user: string | '') => {
        if (user) { }
        return this._filterUsers(user);
      })
    );

    this.filteredUsers
      .pipe(takeUntil(this._unsubscribeAll))
      .subscribe((e) => { });
  }

  ngOnDestroy(): void {
    this._unsubscribeAll.next();
    this._unsubscribeAll.complete();
  }

  sortData(sort: Sort) {
    const data = this.claimList.slice();
    if (!sort.active || sort.direction === '') {
      this.claimTable = data;
      return;
    }

    this.claimTable = this.claimList.slice().sort((a, b) => {
      const isAsc = sort.direction === 'asc';
      switch (sort.active) {
        case 'badgeId': return this.compare(a?.claim_id, b?.claim_id, isAsc);
        case 'csid': return this.compare(a?.user?.code?.toUpperCase(), b?.user?.code?.toUpperCase(), isAsc);
        case 'username': return this.compare(a?.user?.name?.toUpperCase(), b?.user?.name?.toUpperCase(), isAsc);
        case 'remark': return this.compare(a?.remarks?.toUpperCase(), b?.remarks?.toUpperCase(), isAsc);
        case 'app': return this.compare(a?.application.toUpperCase(), b?.application.toUpperCase(), isAsc);
        case 'status': return this.compare(a?.queue.toUpperCase(), b?.queue.toUpperCase(), isAsc);
        case 'issued_at': return this.compare(a?.enabled_at, b?.enabled_at, isAsc);
        case 'expiration': return this.compare(a?.expired_at, b?.expired_at, isAsc);
        case 'issuer': return this.compare(a?.creator?.name.toUpperCase(), b?.creator?.name.toUpperCase(), isAsc);
        default: return 0;
      }
    });
    this.badgeAssignees = new MatTableDataSource(this.claimTable);
    this.badgeAssignees.paginator = this.paginator;
    this.badgeAssignees.sort = this.sort;
  }

  compare(a: number | string, b: number | string, isAsc: boolean) {
    if (!a) {
      a = '';
    }
    return (a < b ? -1 : 1) * (isAsc ? 1 : -1);
  }

  getStatus() {
    this.claimList = this.claimList.map((item) =>
      Object.assign({}, item, { "completed_checklist": "0" }))

    this.claimList.forEach(checkList => {
      var completedChecklistCount = 0;

      if (checkList.user.user_checklists) {
        checkList.user.user_checklists.forEach(user_checklist => {
          if (user_checklist.is_checked === 'yes') {
            completedChecklistCount++;
          }
        });
      }

      checkList.completed_checklist = completedChecklistCount;
    })
  }

  getAllUpdator(data) {
    var updator = ''
    var updatorList = []

    if (data) {
      data.forEach(user_checklist => {
        if (!updatorList.includes(user_checklist.creator_user_checklists.name)) {
          updator += user_checklist.creator_user_checklists.name + "\n";
          updatorList.push(user_checklist.creator_user_checklists.name);
        }
      });
    }

    return { 'updator': updator, 'updator_list': updatorList };
  }

  onChangeDate(event: MatDatepickerInputEvent<Date>) {
    var input_date = new Date(event.value);
    var date_now = new Date(this.maxDate);
    var current_date = input_date.toDateString();
    var date_now_string = date_now.toDateString();
    this.isReadOnly = false;

    if (date_now_string === current_date) {
      this.isReadOnly = true;
    }
  }
}
