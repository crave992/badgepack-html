import { Component, OnInit, OnDestroy, ViewChild, Output, EventEmitter, ElementRef, AfterViewInit } from '@angular/core';
import { fuseAnimations } from '@fuse/animations';

import { takeUntil, startWith, map } from 'rxjs/operators';
import { Subject, Observable } from 'rxjs';

import { Store, Select } from '@ngxs/store';
import { DashboardUserAvailableBadges } from 'app/shared/states/dashboard.actions';
import { DashboardState } from 'app/shared/states/dashboard.state';
import { BadgeService } from 'app/shared/services/badge.service';

import { environment } from 'environments/environment';

import { MatDialog } from '@angular/material/dialog';

import { AuthState } from 'app/shared/states/auth.state';
import { MatAutocomplete, MatAutocompleteSelectedEvent, MatAutocompleteTrigger } from '@angular/material/autocomplete';
import { FormControl, FormGroup, FormBuilder } from '@angular/forms';
import { DescriptionDialogComponent } from 'app/shared/dialogs/description-dialog/description-dialog.component';
import { SharedConfirmationDialogComponent } from 'app/shared/dialogs/shared-confirmation-dialog/shared-confirmation-dialog.component';
import { AssignChecklistDefaults } from 'app/shared/models/assign-checklist.model';
import { Validators } from '@angular/forms';
import { CreateAssignCheckList } from 'app/shared/states/assign-checklist.actions';
import { BadgeAssigned } from 'app/shared/models/badge.model';

import { DatePipe } from '@angular/common';
import { AssignBadge, UpdateAssignedBadge } from 'app/shared/states/badge.actions';

import { COMMA, ENTER } from '@angular/cdk/keycodes';
import { MatChipInputEvent } from '@angular/material/chips';
import { GlobalService } from 'app/shared/services/global.service';
import { SharedService } from 'app/shared/services/shared.service';

@Component({
  selector: 'dashboard-tab-available',
  templateUrl: './dashboard-tab-available.component.html',
  styleUrls: ['./dashboard-tab-available.component.scss'],
  animations: fuseAnimations
})
export class DashboardTabAvailableComponent implements OnInit, OnDestroy, AfterViewInit {
  badges: any[];
  appEndpoint: string;
  width: string;
  user: string;
  availableBadges: any;
  actives: any;
  filterValue: any;

  listUsers = [];
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
  updatedUserChecklist: any[];
  dialogComponent: any;
  timeNow: any;

  dateNow = new Date();

  labelNames: string[] = [];
  displayLabelNames: string[] = [];
  allLabels: string[] = [];
  hiddenLabelNames: string[] = [];
  checkedItems: string[] = [];
  updatedPendingCheckedItems: string[] = [];

  separatorKeysCodes: number[] = [ENTER, COMMA];
  available = [];

  labelNameCtrl = new FormControl();
  labelFilterForm: FormGroup;
  labelCtrl = new FormControl();
  assignChecklistForm: FormGroup;
  assignedBadgesForm: FormGroup;

  auth;
  badgeId;

  showOrHidden = 'show';

  pipe = new DatePipe('en-US');

  @ViewChild('labelInput') labelInput: ElementRef<HTMLInputElement>;
  @ViewChild('labelAuto') badgeMatAutocomplete: MatAutocomplete;
  @ViewChild('labelNameInput') labelNameInput: ElementRef<HTMLInputElement>;
  @ViewChild('autocompleteTrigger') matACTrigger: MatAutocompleteTrigger;

  @Select(AuthState.auth) auth$: Observable<any>;
  @Select(DashboardState.available) availableBadges$: Observable<any>;

  @Output() totalMyBadges = new EventEmitter<number>();

  private _unsubscribeAll: Subject<any>;

  constructor(
    private _badgeService: BadgeService,
    private _store: Store,
    private _dialog: MatDialog,
    private _formBuilder: FormBuilder,
    private _globalService: GlobalService,
    private _dataService: SharedService
  ) {
    this.appEndpoint = environment.appEndpoint;
    this._unsubscribeAll = new Subject();
    this.availableBadges = [];
    this.labels = [];
    this.listLabels = [];
    this.displayLabels = [];
    this.labelIds = [];
  }

  ngOnInit(): void {
    this._store.dispatch(new DashboardUserAvailableBadges('available', { page: 1 }, null));
    this._onInitForm();
    this.getLabels();
    this.getBadges();

    this.availableBadges$
      .pipe(takeUntil(this._unsubscribeAll))
      .subscribe((availableBadges) => {
        this.availableBadges = availableBadges;

        if (this.availableBadges) {
          this.totalMyBadges.emit(this.availableBadges.length || 0);
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
        this._store.dispatch(new DashboardUserAvailableBadges('available', { page: 1 }, reportFormValues));
      }

      this.availableBadges$
        .pipe(takeUntil(this._unsubscribeAll))
        .subscribe((availableBadges) => {
          this.availableBadges = availableBadges;

          if (this.availableBadges) {
            this.totalMyBadges.emit(this.availableBadges.length || 0);
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
      this._store.dispatch(new DashboardUserAvailableBadges('available', { page: 1 }, reportFormValues));
    }

    this.availableBadges$
      .pipe(takeUntil(this._unsubscribeAll))
      .subscribe((availableBadges) => {
        this.availableBadges = availableBadges;

        if (this.availableBadges) {
          this.totalMyBadges.emit(this.availableBadges.length || 0);
        }
      });

    this.displayLabels.splice(0, 1);
    this._filterLabels('');
  }

  addLabel(event): void {
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
      var tempAvailable = Object.assign([], this.availableBadges);
      for (let j = 0; j < this.availableBadges.length; j++) {
        let tempData = Object.assign({}, tempAvailable[j]);

        if (tempData.checklist.length && tempData.description) {
          tempData.show = true;
        } else {
          tempData.show = false;
        }

        tempAvailable[j] = tempData;
      }
      this.availableBadges = tempAvailable;
    }, 1000);
  }

  initAssignedChecklistForm(): void {
    this.assignChecklistForm = this._formBuilder.group({
      badge_id: [AssignChecklistDefaults.badge_id, [Validators.required]],
      user_ids: [AssignChecklistDefaults.user_ids, [Validators.required]],
      checklist_ids: [AssignChecklistDefaults.checklist_ids],
    });
  }

  truncateChar(text: string): string {
    let charlimit = 200;
    if (!text || text.length <= charlimit) {
      return text;
    }

    let shortened = text.substring(0, charlimit) + "...";
    return shortened;
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

      setTimeout(() => {
        this._badgeService.getUserAvailableBadges(null, null).subscribe(
          (response: any) => {
            this.available = response.data
            this.availableBadges = response.data

            if (this.available) {
              this.totalMyBadges.emit(this.available.length || 0);
            }
          },
        );
      }, 300);

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
  }

  onOpenDialog(description, checklist, type = null, action, checklists = null): void {

    this.checkedItems.push(checklist.id);
    let dialogRef;
    let dialogData = {};
    var badgeId;

    if (checklist.length >= 1) {
      badgeId = checklist[0].badge_id
    }

    switch (action) {
      case 'details':
        dialogData = {
          description,
          type,
          checklists: checklist,
          badgeId,
          action,
          confirmText: '',
          cancelText: ''
        };
        this.width = '1200px';
        this.dialogComponent = DescriptionDialogComponent;
        break;
      case 'checklist':
        dialogData = {
          type: 'warning',
          title: 'Are you sure?',
          body: `Have you completed ` + checklist.title + '?',
          action,
          confirmText: 'Yes',
          cancelText: 'No'
        };
        this.width = '800px';
        this.dialogComponent = SharedConfirmationDialogComponent;
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
              this.assignChecklistForm.controls['badge_id'].setValue(checklist.badge_id);
              this.assignChecklistForm.controls['checklist_ids'].setValue([checklist.id]);
              this.assignChecklistForm.controls['user_ids'].setValue([this.auth.id]);

              const assignChecklistFormValues = Object.assign({}, this.assignChecklistForm.getRawValue());
              this._store.dispatch(new CreateAssignCheckList(assignChecklistFormValues));

              setTimeout(() => {
                this._badgeService.getUserAvailableBadges(null, null).subscribe(
                  (response: any) => {
                    this.available = response.data
                    this.availableBadges = response.data

                    if (this.available) {
                      this.totalMyBadges.emit(this.available.length || 0);
                    }
                  },
                );

                var is_update = false;

                if (checklists.checklist.length <= 1) {
                  is_update = true;
                }

                result = { 'isUpdate': is_update, 'user_ids': '', 'is_save': true };

                setTimeout(() => {
                  this.onIssue(result, checklist);
                }, 500);
              }, 500);
              break;
          }
        } else {
          if (action === 'details') {
            this.getBadges();
          } else {
            this._badgeService.getUserAvailableBadges(null, null).subscribe(
              (response: any) => {
                this.availableBadges = response.data
              },
            );
          }

        }

        this.checkedItems = [];
      });
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
        this._store.dispatch(new DashboardUserAvailableBadges('available', { page: 1 }, reportFormValues));
      }

      this.availableBadges$
        .pipe(takeUntil(this._unsubscribeAll))
        .subscribe((availableBadges) => {
          this.availableBadges = availableBadges;

          if (this.availableBadges) {
            this.totalMyBadges.emit(this.availableBadges.length || 0);
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
      this._store.dispatch(new DashboardUserAvailableBadges('available', { page: 1 }, reportFormValues));
    }

    this.availableBadges$
      .pipe(takeUntil(this._unsubscribeAll))
      .subscribe((availableBadges) => {
        this.availableBadges = availableBadges;

        if (this.availableBadges) {
          this.totalMyBadges.emit(this.availableBadges.length || 0);
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

  onSearchFilter(event: Event): void {
    let filterValue = (event.target as HTMLInputElement).value;

    if (filterValue === '') {
      this.getBadges();
    } else {
      filterValue = filterValue.replace(',', '');

      this.available = this.availableBadges.filter((badges) => {
        let valid = false;

        return badges.name.toLowerCase().includes(filterValue.toLowerCase()) ||
          ('BG-' + badges.badge_id.toString()).toLocaleLowerCase()
            .includes(filterValue.toString().toLocaleLowerCase()) || valid;
      });
    }
  }

  getBadges(): void {
    this._badgeService.getUserAvailableBadges(null, null).subscribe(
      (response: any) => {
        this.available = response.data
        this.availableBadges = response.data

        if (this.available) {
          this.totalMyBadges.emit(this.available.length || 0);
        }
      },
    );
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
}
