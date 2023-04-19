import { IntegrationService } from './../../../shared/services/integration.service';
import { Component, OnDestroy, OnInit, ViewEncapsulation, HostBinding, ElementRef, ViewChild, AfterViewInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, FormControl } from '@angular/forms';
import { Subject, Observable } from 'rxjs';
import { takeUntil, map, startWith } from 'rxjs/operators';
import { ActivatedRoute, Params } from '@angular/router';

import { fuseAnimations } from '@fuse/animations';

import { Store, Select } from '@ngxs/store';
import { NewBadge, GetBadge, CreateBadge, UpdateBadge, DeleteBadge } from 'app/shared/states/badge.actions';
import { BadgeState } from 'app/shared/states/badge.state';
import { Badge, BadgeDefaults } from 'app/shared/models/badge.model';
import { BadgeMergeCode, IssuedBadgeMergeCode } from 'app/shared/models/merge-codes.model';

import { GlobalService } from 'app/shared/services/global.service';

import { MatDialog } from '@angular/material/dialog';

import { SharedConfirmationDialogComponent } from 'app/shared/dialogs/shared-confirmation-dialog/shared-confirmation-dialog.component';

import { environment } from 'environments/environment';
import { MatAutocomplete, MatAutocompleteSelectedEvent } from '@angular/material/autocomplete';
import { GroupService } from 'app/shared/services/group.service';
import { UserService } from 'app/shared/services/user.service';
import { BadgeService } from 'app/shared/services/badge.service';
import { COMMA, ENTER, SPACE } from '@angular/cdk/keycodes';
import { MatChipInputEvent } from '@angular/material/chips';
import { AuthState } from 'app/shared/states/auth.state';
import { MatTabChangeEvent } from '@angular/material/tabs';

import { Editor, Toolbar } from "ngx-editor";
import { NotificationDefaults } from 'app/shared/models/notification.model';
@Component({
  selector: 'app-badges-form',
  templateUrl: './badges-form.component.html',
  styleUrls: ['./badges-form.component.scss'],
  encapsulation: ViewEncapsulation.None,
  animations: fuseAnimations
})
export class BadgesFormComponent implements OnInit, OnDestroy, AfterViewInit {

  NewBadgeEditor: Editor;
  SoonToExpireEditor: Editor;
  ExpiredEditor: Editor;
  RemovedbadgeEditor: Editor;
  DescriptionEditor: Editor;
  toolbar: Toolbar = [
    ["bold", "italic"],
    ["ordered_list", "bullet_list"],
    ["blockquote", "link"]
  ];

  @HostBinding('class') classes = 'center';
  badge: Badge;
  pageType: string;
  selectedEvent: string;
  isChecklist: string;
  isToggled: boolean;
  isChecked: boolean;
  eventStatus = true;
  badgeForm: FormGroup;
  assignedBadgesForm: FormGroup;
  checked = true;
  users: [];
  badgeLogoForm: FormGroup;
  badgeLogo: any;
  formLabels: any[];
  separatorKeysCodes: number[] = [ENTER, COMMA];
  disabled = true;

  newBadgeNotifForm: FormGroup;
  soonToExpireNotifForm: FormGroup;
  expiredBadgeNotifForm: FormGroup;
  removedBadgeNotifForm: FormGroup;

  badgeMergeCodes: any[]
  issuedBadgeMergeCodes: any[]

  appEndpoint: string;
  activeTab: string;

  @ViewChild('groupInput') groupInput: ElementRef<HTMLInputElement>;
  @ViewChild('groupAuto') groupMatAutocomplete: MatAutocomplete;
  @ViewChild('labelInput') labelInput: ElementRef<HTMLInputElement>;
  @ViewChild('labelAuto') labelMatAutocomplete: MatAutocomplete;
  groupCtrl = new FormControl();
  labelCtrl = new FormControl();
  filteredGroups: Observable<any[]>;
  filteredlabels: Observable<any[]>;

  badgeGroups: any[];
  listGroups: any[];
  displayGroups: any[];
  badgeLabels: any[];
  listLabels: any[];
  displayLabels: any[];
  quizzes: any[];
  rewardsEvents: any[];

  @Select(BadgeState.current) badge$: Observable<any>;

  private _unsubscribeAll: Subject<any>;

  subs: any;
  role: any;
  notif: any;

  @Select(AuthState.auth) auth$: Observable<any>;

  constructor(
    private _globalService: GlobalService,
    private _groupService: GroupService,
    private _badgeService: BadgeService,
    private _store: Store,
    private _formBuilder: FormBuilder,
    private _activatedRoute: ActivatedRoute,
    private _dialog: MatDialog,
    private _router: ActivatedRoute,
    private _integrationService: IntegrationService
  ) {
    this.badgeForm = this._formBuilder.group({});
    this.badgeGroups = [];
    this.listGroups = [];
    this.displayGroups = [];
    this.badgeLabels = [];
    this.listLabels = [];
    this.displayLabels = [];
    this.formLabels = [];
    this.assignedBadgesForm = this._formBuilder.group({});
    this.badgeLogoForm = this._formBuilder.group({});
    this.badgeMergeCodes = BadgeMergeCode;
    this.issuedBadgeMergeCodes = IssuedBadgeMergeCode;
    this.appEndpoint = environment.appEndpoint;
    this._unsubscribeAll = new Subject();
    this.isChecklist = '';
  }

  ngOnInit(): void {
    this.NewBadgeEditor = new Editor();
    this.SoonToExpireEditor = new Editor();
    this.ExpiredEditor = new Editor();
    this.RemovedbadgeEditor = new Editor();
    this.DescriptionEditor = new Editor();

    this.pageType = 'new';
    this._store.dispatch(new NewBadge());

    this.getUsers();
    this.badgeLogo = false;
    this.initBadgeForm();
    this.initBadgeLogo();
    this.initNewBadgeNotificationForm()
    this.initSoonToExpireBadgeNotificationForm();
    this.initExpiredBadgeNotificationForm();
    this.initRemovedBadgeNotificationForm();
    this.getLabels();

    this._globalService.ngxUiLoader();
    this._badgeService.rewardsEvents()
      .subscribe((response) => {
        this.rewardsEvents = response.data;
      });

    this._activatedRoute.params
      .pipe(takeUntil(this._unsubscribeAll))
      .subscribe(
        (params: Params) => {
          const id = params.id;

          if (id && id !== 'undefined') {
            this._store.dispatch(new GetBadge(id));
          }
        }
      );

    this.badge$
      .pipe(takeUntil(this._unsubscribeAll))
      .subscribe((badge) => {
        this.badgeForm.patchValue({ ...badge });

        if (badge.checklist === 'yes') {
          this.badgeForm.controls['meta']['controls']['rewards_setting']
            .setValue('staff_to_receive_dreampoints_after_acquiring_a_badge');
        }

        setTimeout(() => {
          if (badge.meta.rewards_event_id) {
            this.eventStatus = this.rewardsEvents.some(function (el) {
              return (el.event_id === badge.meta.rewards_event_id);
            });

            if (!this.eventStatus) {
              var memberships = {
                "event_id": badge.meta.rewards_event_id,
                "title": badge.meta.rewards_event_title,
                "expiry": badge.meta.rewards_event_expiry,
                "status": 'expired'
              };

              this.rewardsEvents.push(memberships);
            }
          }
        }, 1000);

        if (badge.badge_id) {
          this.badgeForm.patchValue({ badge_id: 'BG-' + this.badgeForm.controls['badge_id'].value });
        }

        if (badge.ubt_toggle_status) {
          this.badgeForm.controls['template_id'].enable();
          this.badgeForm.controls['template_status'].enable();
        } else {
          this.badgeForm.controls['template_id'].disable();
          this.badgeForm.controls['template_status'].disable();
        }

        if (badge.player_one_toggle_status) {
          this.badgeForm.controls['public_id'].enable();
        } else {
          this.badgeForm.controls['public_id'].disable();
        }

        if (badge.id) {
          this.pageType = 'edit';
          if (badge.labels) {
            this.badgeLabels = Object.assign([], badge.labels);
            for (const label of this.badgeLabels) {
              this.formLabels.push(label.name);
            }
            this.badgeForm.patchValue({ labels: this.formLabels });
            this.filteredlabels = this.labelCtrl.valueChanges.pipe(
              startWith(''),
              map((label: string | '') => {
                return this._filterlabels(label);
              })
            );

            this.filteredlabels
              .pipe(takeUntil(this._unsubscribeAll))
              .subscribe((e) => { });
          }

          if (badge?.groups) {
            this.badgeGroups = Object.assign([], badge?.groups);
            this._filterGroups('');
          }

          if (badge?.notifications) {
            badge?.notifications.forEach((notification: any) => {
              if (notification?.type === 'new-badge') {
                this.newBadgeNotifForm.patchValue(notification);
              } else if (notification?.type === 'soon-to-expire-badge') {
                this.soonToExpireNotifForm.patchValue(notification);
              } else if (notification?.type === 'expired-badge') {
                this.expiredBadgeNotifForm.patchValue(notification);
              } else if (notification?.type === 'removed-badge') {
                this.removedBadgeNotifForm.patchValue(notification);
              }
            });
          }
        }

        this.badge = badge;
        this.isChecklist = badge.checklist;
      });

    this._groupService.getList()
      .pipe(takeUntil(this._unsubscribeAll))
      .subscribe((response) => {
        if (response && response.status === 'success') {
          this.listGroups = response.data;
          this.displayGroups = [];

          this._filterGroups('');
        }

        this._globalService.ngxUiLoader('stop');
      });
  }

  getUsers(): any {
    if (this._router.snapshot.params.id) {
      this._badgeService.assignUser(this._router.snapshot.params.id)
        .subscribe((res: any) => {
          this.users = res.data;
        });
    }
  }

  getLabels(): any {
    this._badgeService.getLabels()
      .subscribe((res: any) => {
        this.listLabels = res.data;
        this.displayLabels = res.data;
      });
  }

  initBadgeForm(): void {
    this.badgeForm = this._formBuilder.group({
      id: [BadgeDefaults.id],
      badge_id: [{ value: BadgeDefaults.badge_id, disabled: this.disabled }],
      name: [BadgeDefaults.name, [Validators.required]],
      description: [BadgeDefaults.description],
      recurrence: [BadgeDefaults.recurrence, [Validators.required]],
      recurrence_length: [BadgeDefaults.recurrence_length, [Validators.required, Validators.min(1), Validators.max(10000)]],
      recurrence_type: [BadgeDefaults.recurrence_type, [Validators.required]],
      status: [BadgeDefaults.status, [Validators.required]],
      meta: this._formBuilder.group({
        'timezone': [BadgeDefaults.meta.timezone, [Validators.required]],
        'image': [null, BadgeDefaults.meta.image],
        'rewards_event_id': [BadgeDefaults.meta.rewards_event_id],
        'rewards_event_title': [BadgeDefaults.meta.rewards_event_title],
        'rewards_event_expiry': [BadgeDefaults.meta.rewards_event_expiry],
        'rewards_setting': [BadgeDefaults.meta.rewards_setting]
      }),
      ubt_toggle_status: [BadgeDefaults.ubt_toggle_status, [Validators.required]],
      template_id: [BadgeDefaults.template_id, [Validators.required]],
      template_status: [BadgeDefaults.template_status, [Validators.required]],
      coverage: [BadgeDefaults.coverage, [Validators.required]],
      groups: [null, [Validators.required]],
      claims: [null],
      external: [BadgeDefaults.external, [Validators.required]],
      labels: [null],
      player_one_toggle_status: [BadgeDefaults.player_one_toggle_status, [Validators.required]],
      public_id: [BadgeDefaults.public_id, [Validators.required]],
    });
  }

  initBadgeLogo(): void {
    this.badgeLogoForm = this._formBuilder.group({
      image: [null]
    });
  }

  initNewBadgeNotificationForm(): void {
    this.newBadgeNotifForm = this._formBuilder.group({
      id: [NotificationDefaults.id],
      subject: [NotificationDefaults.subject, [Validators.required]],
      message: [NotificationDefaults.message, [Validators.required]],
      type: [NotificationDefaults.type]
    });
  }

  initSoonToExpireBadgeNotificationForm(): void {
    this.soonToExpireNotifForm = this._formBuilder.group({
      id: [NotificationDefaults.id],
      subject: [NotificationDefaults.subject, [Validators.required]],
      message: [NotificationDefaults.message, [Validators.required]],
      type: [NotificationDefaults.type]
    });
  }

  initExpiredBadgeNotificationForm(): void {
    this.expiredBadgeNotifForm = this._formBuilder.group({
      id: [NotificationDefaults.id],
      subject: [NotificationDefaults.subject, [Validators.required]],
      message: [NotificationDefaults.message, [Validators.required]],
      type: [NotificationDefaults.type]
    });
  }

  initRemovedBadgeNotificationForm(): void {
    this.removedBadgeNotifForm = this._formBuilder.group({
      id: [NotificationDefaults.id],
      subject: [NotificationDefaults.subject, [Validators.required]],
      message: [NotificationDefaults.message, [Validators.required]],
      type: [NotificationDefaults.type]
    });
  }

  onSubmit(): void {
    if (this.badgeForm.controls['ubt_toggle_status'].value) {
      this.badgeForm.controls['template_id'].markAllAsTouched();
      this.badgeForm.controls['template_status'].markAllAsTouched();
    }

    if (this.badgeForm.valid) {
      const badgeFormValues = Object.assign({}, this.badgeForm.value);

      badgeFormValues.groups = this.badgeGroups.map((group: any) => group.id);

      if (
        this.badge.id
        && this.newBadgeNotifForm.valid
        && this.soonToExpireNotifForm.valid
        && this.expiredBadgeNotifForm.valid
        && this.removedBadgeNotifForm
      ) {
        const newBadgeNotifFormValues = Object.assign({}, this.newBadgeNotifForm.value);
        badgeFormValues.new_badge_notification = newBadgeNotifFormValues;

        const soonToExpireNotifFormValues = Object.assign({}, this.soonToExpireNotifForm.value);
        badgeFormValues.soon_to_expire_notification = soonToExpireNotifFormValues;

        const expiredBadgeNotifFormValues = Object.assign({}, this.expiredBadgeNotifForm.value);
        badgeFormValues.expired_badge_notification = expiredBadgeNotifFormValues;

        const removedBadgeNotifFormValues = Object.assign({}, this.removedBadgeNotifForm.value);
        badgeFormValues.removed_badge_notification = removedBadgeNotifFormValues;

        if (badgeFormValues.description === '<p></p>') {
          badgeFormValues.description = '';
        }

        this._store.dispatch(new UpdateBadge(this.badge.id, badgeFormValues));
        if (this.badgeLogo !== false) {
          this.onUpload();
        }
      } else {
        this._store.dispatch(new CreateBadge(badgeFormValues, this.badgeLogo));
      }

      this.getUsers();
    }
  }

  onUpload(): void {
    if (this.badgeLogo) {
      this._badgeService.uploadBadgeLogo(this.badge.id, this.badgeLogo).subscribe(
        (res: any) => {
          this._store.dispatch(new GetBadge(this.badge.id));
        }
      );
    }
  }

  onChangeImage(file: any): void {
    if (file && file.length > 0) {
      this.badgeLogo = file.item(0);
    }
  }

  openDialog(action): void {
    let dialogRef;

    let dialogData = {};

    switch (action) {
      case 'delete':
        dialogData = {
          type: 'warning',
          title: 'Are you sure?',
          body: `Deleting this badge will permanently remove it from the list.`,
          confirmText: '',
          cancelText: ''
        };
        break;
    }

    dialogRef = this._dialog.open(SharedConfirmationDialogComponent, {
      width: '480px',
      data: dialogData
    });

    dialogRef.afterClosed()
      .pipe(takeUntil(this._unsubscribeAll))
      .subscribe(result => {
        if (result) {
          switch (action) {
            case 'delete':
              this._store.dispatch(new DeleteBadge(this.badge.id)).subscribe(
                () => {
                  this._store.dispatch(new GetBadge(this.badge?.id));
                }
              );
              break;
          }
        }
      });
  }

  removeGroup(group: any): void {
    const index = this.badgeGroups.indexOf(group);

    if (index >= 0) {
      this.badgeGroups.splice(index, 1);

      if (this.badgeGroups.length < 1) {
        this.badgeForm.patchValue({ groups: null });
      }

      this._filterGroups('');
    }
  }

  removeLabels(label: any): void {
    const index = this.badgeLabels.indexOf(label);

    if (index >= 0) {
      this.badgeLabels.splice(index, 1);
      this.formLabels.splice(index, 1);

      this.badgeForm.patchValue({ labels: this.formLabels });

      this.filteredlabels = this.labelCtrl.valueChanges.pipe(
        startWith(''),
        map((label: string | '') => {
          return this._filterlabels(label);
        })
      );

      this.filteredlabels
        .pipe(takeUntil(this._unsubscribeAll))
        .subscribe((e) => { });


      this._filterGroups('');
    }
  }

  selectedGroup(event: MatAutocompleteSelectedEvent): void {
    this.badgeGroups.push(event.option.value);

    this.groupInput.nativeElement.value = '';
    this.groupCtrl.setValue('');
    this.badgeForm.patchValue({ groups: '1' });

    this._filterGroups('');
  }

  selectedLabel(event: MatAutocompleteSelectedEvent): void {
    this.badgeLabels.push(event.option.value);
    this.formLabels.push(event.option.value.name);

    this.labelInput.nativeElement.value = '';
    this.labelCtrl.setValue('');
    this.badgeForm.patchValue({ labels: this.formLabels });

    this._filterGroups('');
  }

  addTags(event: MatChipInputEvent): void {
    const labelInput = event.input;
    const labelValue = (event.value || '').trim();

    if (labelValue) {
      this.badgeLabels.push({ name: event.value });
      this.formLabels.push(event.value);

      this.badgeForm.patchValue({ labels: this.formLabels });
    }

    if (labelInput) {
      labelInput.value = '';
    }

    this.labelCtrl.setValue('');
  }

  toggleUberticket($event): void {
    this.isToggled = $event.checked;
    this.badgeForm.controls['ubt_toggle_status'].setValue($event.checked);

    if (this.badgeForm.controls['ubt_toggle_status'].value) {
      this.badgeForm.controls['template_id'].enable();
      this.badgeForm.controls['template_status'].enable();
    } else {
      this.badgeForm.controls['template_id'].disable();
      this.badgeForm.controls['template_status'].disable();
    }
  }

  togglePlayerOne($event): void {
    this.isToggled = $event.checked;
    this.badgeForm.controls['player_one_toggle_status'].setValue($event.checked);

    if (this.badgeForm.controls['player_one_toggle_status'].value) {
      this.badgeForm.controls['public_id'].enable();
    } else {
      this.badgeForm.controls['public_id'].disable();
    }
  }

  recurranceCheck(): void {
    if (this.badgeForm.controls['recurrence_type'].value === 'Expires-after' || this.badgeForm.controls['recurrence_type'].value === 'End-of') {
      this.badgeForm.controls['recurrence'].enable();
      this.badgeForm.controls['recurrence_length'].enable();
    }
    else {
      this.badgeForm.controls['recurrence'].disable();
      this.badgeForm.controls['recurrence_length'].disable();
      this.badgeForm.controls['recurrence'].clearValidators();
      this.badgeForm.controls['recurrence_length'].clearValidators();
      this.badgeForm.patchValue({
        recurrence: null,
        recurrence_length: null,
      });

    }
  }

  private _filterGroups(value: any): any[] {
    if (typeof value === 'string') {
      const filterValue = value.toLowerCase();
      return this.displayGroups = this.listGroups.filter((group) => {
        const sGroup = this.badgeGroups.slice().find((u) => {
          return u.id === group.id;
        });

        const groupCode = group.code.toLowerCase();
        const groupName = group.name.toLowerCase();

        return !sGroup && (groupName.indexOf(filterValue) >= 0 || groupCode.indexOf(filterValue) >= 0);
      });
    }

    return [];
  }

  private _filterlabels(value: any): any[] {
    if (typeof value === 'string') {
      const filterlabels = value.toLowerCase();
      return this.displayLabels = this.listLabels.filter((label) => {
        const sLabel = this.badgeLabels.slice().find((l) => {
          return l.id === label.id;
        });

        label = label.name.toLowerCase();

        return !sLabel && (label.indexOf(filterlabels) >= 0);
      });
    }

    return [];
  }

  ngAfterViewInit(): void {
    this.filteredGroups = this.groupCtrl.valueChanges.pipe(
      startWith(''),
      map((group: string | '') => {
        return this._filterGroups(group);
      })
    );

    this.filteredGroups
      .pipe(takeUntil(this._unsubscribeAll))
      .subscribe((e) => { });

    this.filteredlabels = this.labelCtrl.valueChanges.pipe(
      startWith(''),
      map((label: string | '') => {
        return this._filterlabels(label);
      })
    );

    this.filteredlabels
      .pipe(takeUntil(this._unsubscribeAll))
      .subscribe((e) => { });
  }

  onTabChanged(tabChangeEvent: MatTabChangeEvent): void {
    this.activeTab = tabChangeEvent.tab.textLabel;

    if (tabChangeEvent.tab.textLabel === 'Issue') {
      this.checkBadge();
    }
  }

  checkBadge(): void {
    this._badgeService.getBadge(this._router.snapshot.params.id)
      .subscribe((badge: any) => {
        this.isChecklist = badge.data.checklist;
      });
  }

  ngOnDestroy(): void {
    this.NewBadgeEditor.destroy();
    this.SoonToExpireEditor.destroy();
    this.ExpiredEditor.destroy();
    this.RemovedbadgeEditor.destroy();
    this.DescriptionEditor.destroy();

    this._unsubscribeAll.next();
    this._unsubscribeAll.complete();
  }

  onCopyLink(inputElement) {
    inputElement.select();
    document.execCommand('copy');
    inputElement.setSelectionRange(0, 0);
  }

  onChangeSelect(e) {
    var selectedEvent = this.rewardsEvents.filter((event) => {
      if (e.value === event.event_id) {
        this.eventStatus = true;

        if (event.status === 'expired') {
          this.eventStatus = false;
        }
      }
      return e.value === event.event_id;
    });

    this.badgeForm.controls['meta']['controls']['rewards_event_title']
      .setValue(selectedEvent[0].title);
    this.badgeForm.controls['meta']['controls']['rewards_event_expiry']
      .setValue(selectedEvent[0].expiry);
    this.badgeForm.controls['meta']['controls']["rewards_setting"].setValidators(Validators.required);
    this.badgeForm.controls['meta']['controls']["rewards_setting"].updateValueAndValidity();
  }
}
