import { Component, OnInit, OnDestroy, ViewChild, Output, EventEmitter, ElementRef, AfterViewInit } from '@angular/core';
import { fuseAnimations } from '@fuse/animations';

import { takeUntil, startWith, map } from 'rxjs/operators';
import { Subject, Observable, empty } from 'rxjs';

import { Store, Select } from '@ngxs/store';
import { DashboardUserAcquiredeBadges } from 'app/shared/states/dashboard.actions';
import { DashboardState } from 'app/shared/states/dashboard.state';
import { BadgeService } from 'app/shared/services/badge.service';

import { environment } from 'environments/environment';

import { MatDialog } from '@angular/material/dialog';

import { AuthState } from 'app/shared/states/auth.state';
import { FormControl, FormGroup, FormBuilder } from '@angular/forms';
import { DescriptionDialogComponent } from 'app/shared/dialogs/description-dialog/description-dialog.component';
import { GlobalService } from 'app/shared/services/global.service';

import { COMMA, ENTER } from '@angular/cdk/keycodes';
import { MatAutocompleteSelectedEvent, MatAutocomplete, MatAutocompleteTrigger } from '@angular/material/autocomplete';
import { MatChipInputEvent } from '@angular/material/chips';
import { SharedService } from 'app/shared/services/shared.service';
import { threadId } from 'worker_threads';

@Component({
  selector: 'dashboard-tab-acquired',
  templateUrl: './dashboard-tab-acquired.component.html',
  styleUrls: ['./dashboard-tab-acquired.component.scss'],
  animations: fuseAnimations
})
export class DashboardTabAcquiredComponent implements OnInit, OnDestroy, AfterViewInit {
  appEndpoint: string;
  user: string;
  filterValue: any;
  acquiredBadges: any;
  actives: any;
  acquired = [];
  badges = [];
  listUsers = [];
  updatedAcquiredBadges: any[];

  selectableLabels = true;
  removableLabels = true;
  panelOpenState = false;
  showSeemore = false;
  visible = true;
  selectable = true;
  removable = true;

  filteredLabels: Observable<any[]>;
  filteredLabelNames: Observable<any[]>;

  auth;
  badgeId;

  showOrHidden = 'show';
  labelFilterForm: FormGroup;
  labelNameCtrl = new FormControl();
  labelCtrl = new FormControl();

  separatorKeysCodes: number[] = [ENTER, COMMA];

  labelNames: string[] = [];
  displayLabelNames: string[] = [];
  hiddenLabelNames: string[] = [];
  allLabels: string[] = [];

  labels: any[];
  listLabels: any[];
  displayLabels: any[];
  labelIds: any[];
  updatedUserChecklist: any[];

  @ViewChild('labelNameInput') labelNameInput: ElementRef<HTMLInputElement>;
  @ViewChild('auto') matAutocomplete: MatAutocomplete;
  @ViewChild('autocompleteTrigger') matACTrigger: MatAutocompleteTrigger;
  @ViewChild('labelInput') labelInput: ElementRef<HTMLInputElement>;
  @ViewChild('labelAuto') badgeMatAutocomplete: MatAutocomplete;
  @ViewChild('alert', { read: ElementRef }) alert: ElementRef;

  @Select(AuthState.auth) auth$: Observable<any>;
  @Select(DashboardState.acquired) acquiredBadges$: Observable<any>;

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
    this.acquiredBadges = [];
    this.labels = [];
    this.listLabels = [];
    this.displayLabels = [];
    this.labelIds = [];
  }

  ngOnInit(): void {
    this._dataService.currentAcquiredBadges.subscribe(
      badges => {
        if (badges.badges) {
          this.acquiredBadges = badges.badges;
          this.acquired = badges.badges;
          this.totalMyBadges.emit(badges.acquired_count || 0);
        }
      }
    );

    this._store.dispatch(new DashboardUserAcquiredeBadges('acquired', { page: 1 }, null));
    this._onInitForm();
    this.getLabels();
    this.getBadges();

    this.auth$
      .pipe(takeUntil(this._unsubscribeAll))
      .subscribe((auth) => {
        this.auth = auth;
      });

    if (this.updatedAcquiredBadges) {
      this.acquired = this.updatedAcquiredBadges;
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

        this._store.dispatch(new DashboardUserAcquiredeBadges('acquired', { page: 1 }, reportFormValues));
      }

      this.acquiredBadges$
        .pipe(takeUntil(this._unsubscribeAll))
        .subscribe((acquiredBadges) => {
          this.acquiredBadges = acquiredBadges;

          if (this.acquiredBadges) {
            this.totalMyBadges.emit(this.acquiredBadges.length || 0);
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
      this._store.dispatch(new DashboardUserAcquiredeBadges('acquired', { page: 1 }, reportFormValues));
    }

    this.acquiredBadges$
      .pipe(takeUntil(this._unsubscribeAll))
      .subscribe((acquiredBadges) => {
        this.acquiredBadges = acquiredBadges;

        if (this.acquiredBadges) {
          this.totalMyBadges.emit(this.acquiredBadges.length || 0);
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
      var updatedBadge = [];
      this.acquiredBadges.map(arrayElement => {
        if (arrayElement.badge.user_checklist.length) {
          var dom = document.getElementById(arrayElement.badge.claim_id).getBoundingClientRect();

          if (dom.height > 200) {
            arrayElement = { ...arrayElement.badge, show: true };
            updatedBadge.push(arrayElement);
          }
        }
      });

      this.updatedUserChecklist = updatedBadge;
    }, 2000);
  }

  truncateChar(text: string): string {
    let charlimit = 300;

    if (!text || text.length <= charlimit) {
      return text;
    }

    let shortened = text.substring(0, charlimit) + "...";
    return shortened;
  }

  displaySeeMore(id) {
    var show = false;
    if (this.updatedUserChecklist) {
      this.updatedUserChecklist.forEach(checklist => {
        if (checklist.user_checklist && checklist.claim_id === id && checklist.show === true) {
          show = true;
        }
      });
    }

    return show;
  }

  onOpenDialog(description, checklists, meta = null): void {
    let dialogRef;
    let dialogData = {
      description,
      checklists,
      meta,
      type: 'acquired',
      confirmText: '',
      cancelText: ''
    };

    dialogRef = this._dialog.open(DescriptionDialogComponent, {
      width: '1200px',
      data: dialogData
    });
  }

  getBadges(): void {
    this._badgeService.getUserAcquiredBadges(null, null).subscribe(
      (response: any) => {
        this.acquiredBadges = response.data.badges
        this.acquired = response.data.badges

        if (this.acquired) {
          this.totalMyBadges.emit(this.acquired.length || 0);
        }
      },
    );
  }

  onSearchFilter(event: Event): void {
    let filterValue = (event.target as HTMLInputElement).value;

    if (filterValue === '') {
      this.getBadges();
    } else {
      filterValue = filterValue.replace(',', '');
      this.acquired = this.acquiredBadges.filter((badges) => {
        let valid = false;
        return badges.badge.name.toLowerCase().includes(filterValue.toLowerCase()) ||
          ('BI-' + badges.badge.claim_id.toString()).toLocaleLowerCase()
            .includes(filterValue.toString().toLocaleLowerCase()) || valid;
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
        this._store.dispatch(new DashboardUserAcquiredeBadges('acquired', { page: 1 }, reportFormValues));
      }

      this.acquiredBadges$
        .pipe(takeUntil(this._unsubscribeAll))
        .subscribe((acquiredBadges) => {
          this.acquiredBadges = acquiredBadges;

          if (this.acquiredBadges) {
            this.totalMyBadges.emit(this.acquiredBadges.length || 0);
          }
        });
    }
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
      this._store.dispatch(new DashboardUserAcquiredeBadges('acquired', { page: 1 }, reportFormValues));
    }

    this.acquiredBadges$
      .pipe(takeUntil(this._unsubscribeAll))
      .subscribe((acquiredBadges) => {
        this.acquiredBadges = acquiredBadges;

        if (this.acquiredBadges) {
          this.totalMyBadges.emit(this.acquiredBadges.length || 0);
        }
      });

    requestAnimationFrame(() => {
      this.openAuto(this.matACTrigger);
    })
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

  private _filter(value: string): string[] {
    const filterValue = value.toLowerCase();
    return this.allLabels.filter(label => label.toLowerCase().indexOf(filterValue) >= 0);
  }

  openAuto(trigger: MatAutocompleteTrigger) {
    trigger.openPanel();
    this.labelNameInput.nativeElement.focus();
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

