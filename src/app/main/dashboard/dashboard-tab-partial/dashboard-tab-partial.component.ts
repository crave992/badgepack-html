import { Component, OnInit, OnDestroy, ViewChild, Output, EventEmitter, ElementRef, AfterViewInit } from '@angular/core';

import { takeUntil, startWith, map } from 'rxjs/operators';
import { Subject, Observable } from 'rxjs';

import { Store, Select } from '@ngxs/store';
import { DashboardPartials, DashboardUserAcquiredeBadges } from 'app/shared/states/dashboard.actions';
import { DashboardState } from 'app/shared/states/dashboard.state';
import { BadgeService } from 'app/shared/services/badge.service';

import { environment } from 'environments/environment';

import { AuthState } from 'app/shared/states/auth.state';

import { DashboardBadge } from '../dashboard-tab-claimed/dashboard-badge-model.interface';

import { MatAutocomplete, MatAutocompleteSelectedEvent, MatAutocompleteTrigger } from '@angular/material/autocomplete';

import { FormControl, FormGroup, FormBuilder, Validators } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { DescriptionDialogComponent } from 'app/shared/dialogs/description-dialog/description-dialog.component';
import { SharedConfirmationDialogComponent } from 'app/shared/dialogs/shared-confirmation-dialog/shared-confirmation-dialog.component';
import { UpdateAssignedCheckList } from 'app/shared/states/assign-checklist.actions';

import { DatePipe } from '@angular/common';
import { BadgeAssigned } from 'app/shared/models/badge.model';
import { AssignBadge, UpdateAssignedBadge } from 'app/shared/states/badge.actions';

import { COMMA, ENTER } from '@angular/cdk/keycodes';
import { MatChipInputEvent } from '@angular/material/chips';
import { GlobalService } from 'app/shared/services/global.service';
import { SharedService } from 'app/shared/services/shared.service';

@Component({
  selector: 'dashboard-tab-partial',
  templateUrl: './dashboard-tab-partial.component.html',
  styleUrls: ['./dashboard-tab-partial.component.scss']
})
export class DashboardTabPartialComponent implements OnInit, OnDestroy, AfterViewInit {
  partials: any;
  filterValue: any;
  actives: any;
  timeNow: any;
  dialogComponent: any;

  pipe = new DatePipe('en-US');
  dateNow = new Date();

  selectableLabels = true;
  removableLabels = true;
  showSeemore = false;
  selectable = true;
  removable = true;

  filteredLabels: Observable<any[]>;
  filteredLabelNames: Observable<any[]>;

  labels: any[];
  listLabels: any[];
  displayLabels: any[];
  labelIds: any[];
  checklists: any[];
  listUsers = [];
  updatedUserChecklist: any[];
  updatedPartialBadges: any[];

  labelNames: string[] = [];
  displayLabelNames: string[] = [];
  allLabels: string[] = [];
  hiddenLabelNames: string[] = [];
  checkedItems: string[] = [];

  separatorKeysCodes: number[] = [ENTER, COMMA];
  partialBadges = [];

  labelNameCtrl = new FormControl();
  assignedBadgesForm: FormGroup;
  labelFilterForm: FormGroup;
  labelCtrl = new FormControl();

  user: string;
  appEndpoint: string;
  width: string;
  showOrHidden = 'show';

  auth;
  badgeId;

  badges: DashboardBadge[];

  @ViewChild('labelInput') labelInput: ElementRef<HTMLInputElement>;
  @ViewChild('labelAuto') badgeMatAutocomplete: MatAutocomplete;
  @ViewChild('labelNameInput') labelNameInput: ElementRef<HTMLInputElement>;
  @ViewChild('autocompleteTrigger') matACTrigger: MatAutocompleteTrigger;

  @Select(AuthState.auth) auth$: Observable<any>;
  @Select(DashboardState.partials) partials$: Observable<any>;

  @Output() totalMyBadges = new EventEmitter<number>();

  private _unsubscribeAll: Subject<any>;
  constructor(
    private _badgeService: BadgeService,
    private _store: Store,
    private _formBuilder: FormBuilder,
    private _dialog: MatDialog,
    private _globalService: GlobalService,
    private _dataService: SharedService
  ) {
    this.appEndpoint = environment.appEndpoint;
    this.partials = [];

    this._unsubscribeAll = new Subject();
    this.labels = [];
    this.listLabels = [];
    this.displayLabels = [];
    this.labelIds = [];
  }

  ngOnInit(): void {
    this._dataService.currentPendingBadges.subscribe(
      badges => {
        if (badges.checked_items) {
          this.partialBadges = badges.badges;
          this.partials = badges.badges;
          this.checkedItems = badges.checked_items;
          this.totalMyBadges.emit(badges.pending_count || 0);
        }
      }
    );

    this._store.dispatch(new DashboardPartials('partial', { page: 1 }, null));
    this._onInitForm();
    this.getLabels();
    this.getBadges();

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
        if (this.partials) {
          this.totalMyBadges.emit(this.partials.length || 0);
        }
      });

    this.auth$
      .pipe(takeUntil(this._unsubscribeAll))
      .subscribe((auth) => {
        this.auth = auth;
      });

    let hour = this.dateNow.getHours() < 10 ? '0' : '';
    hour = hour + this.dateNow.getHours();
    let minutes = this.dateNow.getMinutes() < 10 ? '0' : '';
    minutes = minutes + this.dateNow.getMinutes();
    const time = hour + ':' + minutes;

    this.tConvert(time);
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

  isChecked(value) {
    if (value === 'yes') {
      return true;
    } else {
      return false;
    }
  }

  getProgress(checklists) {
    var completedChecklist = 0;
    var userChecklistCount = 0;

    if (checklists !== null) {
      for (var i = 0; i < checklists.length; i++) {
        if (
          ((checklists[i].deleted_at !== null
            && checklists[i].is_checked === 'yes')
            || (checklists[i].deleted_at === null))
        ) {
          userChecklistCount++;

          if (checklists[i].is_checked === 'yes') {
            completedChecklist++
          }
        }
      }

      return Math.round((completedChecklist / userChecklistCount) * 100);
    } else {
      return '';
    }
  }

  getProgressLabel(checklists) {
    var completedChecklist = 0;
    var userChecklistCount = 0;

    if (checklists !== null) {
      for (var i = 0; i < checklists.length; i++) {
        if (
          ((checklists[i].deleted_at !== null
            && checklists[i].is_checked === 'yes')
            || (checklists[i].deleted_at === null))
        ) {
          userChecklistCount++;

          if (checklists[i].is_checked === 'yes') {
            completedChecklist++
          }
        }
      }

      return completedChecklist + '/' + userChecklistCount;
    } else {
      return '';
    }
  }

  private _onInitForm(): void {
    this.labelFilterForm = this._formBuilder.group({
      labelIds: []
    });
  }

  getLabels(): any {
    this._badgeService.getLabels()
      .subscribe((res: any) => {
        this.listLabels = res.data;
        this.displayLabels = res.data;

        this.displayLabels.forEach(label => {
          this.allLabels.push(label.name);
        });

        this.filteredLabelNames = this.labelNameCtrl.valueChanges.pipe(
          startWith(null),
          map((label: string | null) => label ? this._filter(label) : this.allLabels.slice()));
      });
  }

  private _filter(value: string): string[] {
    const filterValue = value.toLowerCase();

    return this.allLabels.filter(label => label.toLowerCase().indexOf(filterValue) >= 0);
  }

  ngOnDestroy(): void {
    this._unsubscribeAll.next();
    this._unsubscribeAll.complete();
  }

  removeLabel(label: any): void {
    const index = this.labels.indexOf(label);
    if (index >= 0) {
      this.labels.splice(index, 1);
      this.labelIds.splice(index, 1);
      this.labelFilterForm.patchValue({ labelIds: this.labelIds });

      if (this.labelFilterForm.valid) {
        const reportFormValues = this.labelFilterForm.value;
        this._store.dispatch(new DashboardPartials('partial', { page: 1 }, reportFormValues));
      }

      this.partials$
        .pipe(takeUntil(this._unsubscribeAll))
        .subscribe((partials) => {
          this.partials = partials;

          if (this.partials) {
            this.totalMyBadges.emit(this.partials.length || 0);
          }
        });

      this._filterLabels('');
    }
  }

  selectedLabel(event: MatAutocompleteSelectedEvent): void {
    this.labels.push(event.option.value);
    this.labelIds.push(event.option.value.id);
    this.labelInput.nativeElement.value = '';
    this.labelCtrl.setValue('');
    this.labelFilterForm.patchValue({ labelIds: this.labelIds });

    if (this.labelFilterForm.valid) {
      const reportFormValues = this.labelFilterForm.value;
      this._store.dispatch(new DashboardPartials('partial', { page: 1 }, reportFormValues));
    }

    this.partials$
      .pipe(takeUntil(this._unsubscribeAll))
      .subscribe((partials) => {
        this.partials = partials;

        if (this.partials) {
          this.totalMyBadges.emit(this.partials.length || 0);
        }
      });

    this.displayLabels.splice(0, 1);
    this._filterLabels('');
  }

  onAddLabel(event): void {
    this.filteredLabels.pipe(takeUntil(this._unsubscribeAll)).subscribe((e) => { });
  }

  private _filterLabels(value: any): any {
    if (typeof value === 'string') {
      const filterValue = value.toLowerCase();
      return this.displayLabels = this.listLabels.filter((label) => {
        const sLabel = this.labels.slice().find((l) => {
          return l.id === label.id;
        });

        const labelName = label?.name.toLowerCase();

        return !sLabel && (labelName.indexOf(filterValue) >= 0);
      });
    }
    return [];
  }

  ngAfterViewInit(): void {
    this.filteredLabels = this.labelCtrl.valueChanges.pipe(
      startWith(''),
      map((label: string | '') => {
        if (label) { }
        return this._filterLabels(label);
      })
    );

    this.filteredLabels
      .pipe(takeUntil(this._unsubscribeAll))
      .subscribe((e) => { });

    setTimeout(() => {
      for (let j = 0; j < this.partials.length; j++) {
        var tempPartials = Object.assign([], this.partials);
        let tempData = Object.assign({}, tempPartials[j]);

        if (tempData.user_checklist && tempData.badge.description) {
          tempData.show = true;
        } else {
          tempData.show = false;
        }

        tempPartials[j] = tempData;
      }
      this.partials = tempPartials;
    }, 1000);
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

  onOpenDialog(description, checklist, type = null, action, checklists = null, event = null): void {
    let dialogRef;
    let dialogData = {};

    switch (action) {
      case 'details':
        dialogData = {
          description,
          type,
          checklists: checklist,
          action,
          meta: checklists.badge.meta,
          badgeCreator: checklists.badge.creator,
          confirmText: '',
          cancelText: ''
        };
        this.width = '1200px';
        this.dialogComponent = DescriptionDialogComponent;
        break;
      case 'pending':
        if (!this.checkedItems.includes(checklist?.checklist_id)) {
          dialogData = {
            type: 'warning',
            title: 'Are you sure?',
            body: `Have you completed ` + checklist.checklist_info.title + '?',
            action,
            confirmText: 'Yes',
            cancelText: 'No'
          };
        } else {
          dialogData = {
            type: 'warning',
            title: 'Notice',
            body: `You are not allowed to select this item. If you want to update this item, Please contact ` + checklists.badge.creator,
            confirmText: '',
            cancelText: 'Close'
          };
        }
        this.width = '800px';
        this.dialogComponent = SharedConfirmationDialogComponent;
        this.checkedItems.push(checklist.checklist_id);
        break;
    }

    dialogRef = this._dialog.open(this.dialogComponent, {
      width: this.width,
      data: dialogData
    });

    dialogRef
      .afterClosed()
      .pipe(takeUntil(this._unsubscribeAll))
      .subscribe((status) => {
        if (status.is_save !== 'undefined' && status.is_save) {
          switch (action) {
            case 'pending':
              if (checklist.is_checked === 'no') {
                const formValues = {
                  'badge_id': checklists.badge_id,
                  'checklist_ids': [checklist.checklist_id],
                  'user_id': this.auth.id,
                  'claim_id': checklists.claim_id,
                  'unchecked_checklist_ids': []
                }

                const assignChecklistFormValues = Object.assign({}, formValues);
                this._store.dispatch(new UpdateAssignedCheckList(checklists.badge_id, assignChecklistFormValues));

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
                        'claim_id': checklists.claim_id,
                        'is_save': true
                      }

                      setTimeout(() => {
                        if (completeBadge) {
                          this.onIssue(result, checklist);
                        }
                      }, 500);
                    },
                  );
                }, 500);
                break;
              }
          }
        } else {
          if (action === 'details') {
            this.getUpdatedPartialBadges();
          } else {
            if (event) {
              var index = this.checkedItems.indexOf(checklist.checklist_id);
              if (index !== -1) {
                this.checkedItems.splice(index, 1);
              }
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

        setTimeout(() => {
          this.getUpdatedPartialBadges();
        }, 300);

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

      this.assignedBadgesForm.patchValue({
        user_ids: null,
        remarks: null,
        meta: {
          acquired_date: this.dateNow,
          acquired_time: this.timeNow,
          date_now: this.dateNow,
        },
      });
    }
  }

  add(event: MatChipInputEvent): void {
    const input = event.input;
    const value = event.value;

    if ((value || '').trim()) {
      this.labelNames.push(value.trim());
    }

    if (input) {
      input.value = '';
    }

    this.labelNameCtrl.setValue(null);
  }

  selected(event: MatAutocompleteSelectedEvent): void {
    const newValue = event.option.viewValue;

    if (this.labelNames.includes(newValue)) {
      this.labelNames = [...this.labelNames.filter(label => label !== newValue)];
    } else {
      this.labelNames.push(event.option.viewValue);
      this.displayLabelNames.push(event.option.viewValue);
    }

    this.labelNameInput.nativeElement.value = '';
    this.labelNameCtrl.setValue(null);
    this.getLabelIds();
    this.labelCtrl.setValue('');
    this.labelFilterForm.patchValue({ labelIds: this.labelIds });

    if (this.labelFilterForm.valid) {
      const reportFormValues = this.labelFilterForm.value;
      this._store.dispatch(new DashboardPartials('partial', { page: 1 }, reportFormValues));
    }

    this.partials$
      .pipe(takeUntil(this._unsubscribeAll))
      .subscribe((partials) => {
        this.partials = partials;

        if (this.partials) {
          this.totalMyBadges.emit(this.partials.length || 0);
        }
      });

    requestAnimationFrame(() => {
      this.openAuto(this.matACTrigger);
    })
  }

  openAuto(trigger: MatAutocompleteTrigger) {
    trigger.openPanel();
    this.labelNameInput.nativeElement.focus();
  }

  onSearchFilter(event: Event): void {
    let filterValue = (event.target as HTMLInputElement).value;

    if (filterValue === '') {
      this.getBadges();
    } else {
      filterValue = filterValue.replace(',', '');

      this.partialBadges = this.partials.filter((badges) => {
        let valid = false;

        return badges.badge.name.toLowerCase().includes(filterValue.toLowerCase()) ||
          ('BI-' + badges.claim_id.toString()).toLowerCase()
            .includes(filterValue.toString().toLowerCase()) || valid;
      });
    }
  }

  getBadges(): void {
    this.getUpdatedPartialBadges();
  }

  remove(label: string): void {
    const index = this.labelNames.indexOf(label);
    const displayNameIndex = this.displayLabelNames.indexOf(label);

    if (this.hiddenLabelNames.length) {
      this.displayLabelNames.push(this.hiddenLabelNames[0]);
    }

    this.hiddenLabelNames = this.hiddenLabelNames.slice(1);

    if (index >= 0) {
      this.labelNames.splice(index, 1);
      this.displayLabelNames.splice(displayNameIndex, 1);
      this.labelIds = [];
      this.labelNameCtrl.setValue(null);
      this.getLabelIds();
      this.labelCtrl.setValue('');
      this.labelFilterForm.patchValue({ labelIds: this.labelIds });

      if (this.hiddenLabelNames.length <= 0) {
        this.showSeemore = false;
      }

      if (this.labelFilterForm.valid) {
        const reportFormValues = this.labelFilterForm.value;
        this._store.dispatch(new DashboardPartials('partial', { page: 1 }, reportFormValues));
      }

      this.partials$
        .pipe(takeUntil(this._unsubscribeAll))
        .subscribe((partials) => {
          this.partials = partials;

          if (this.partials) {
            this.totalMyBadges.emit(this.partials.length || 0);
          }
        });
    }
  }

  getLabelIds() {
    this.displayLabels.forEach(label => {
      this.labelNames.forEach(name => {
        if (label.name === name && !this.labelIds.includes(label.id)) {
          this.labelIds.push(label.id);
        }
      });
    });
  }

  truncateChips(event: Event) {
    var width = 0;
    this.labelNames.forEach(element => {

      if (document.getElementById(element)) {
        width += document.getElementById(element).offsetWidth;

        if (width >= 500) {
          const index = this.displayLabelNames.indexOf(element);
          this.hiddenLabelNames.push(element);
          this.displayLabelNames.splice(-1, 1);
          this.showSeemore = true;
        }
      }
    });
  }

  deselectChecklistMessage(isChecked, checklist, partial) {
    if (isChecked) {
      this.onOpenDialog(null, checklist, null, 'pending', partial, null);
    }
  }

  getUpdatedPartialBadges() {
    this._badgeService.myPartialBadges(null, null).subscribe(
      (response: any) => {
        this.partialBadges = response.data;
        this.partials = response.data;

        if (this.partialBadges) {
          this.totalMyBadges.emit(this.partialBadges.length || 0);
        }
      },
    );
  }
}
