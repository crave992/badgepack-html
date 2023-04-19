import { Component, OnInit, OnDestroy, ViewChild, Output, EventEmitter, ElementRef, AfterViewInit } from '@angular/core';
import { fuseAnimations } from '@fuse/animations';

import { takeUntil, startWith, map } from 'rxjs/operators';
import { Subject, Observable } from 'rxjs';

import { Store, Select } from '@ngxs/store';
import { DashboardClaims } from 'app/shared/states/dashboard.actions';
import { DashboardState } from 'app/shared/states/dashboard.state';
import { BadgeService } from 'app/shared/services/badge.service';

import { environment } from 'environments/environment';

import { MatDialog } from '@angular/material/dialog';

import { AuthState } from 'app/shared/states/auth.state';
import { DashboardBadge } from './dashboard-badge-model.interface';
import { MatAutocomplete, MatAutocompleteSelectedEvent } from '@angular/material/autocomplete';
import { FormControl, FormGroup, FormBuilder } from '@angular/forms';

@Component({
  selector: 'dashboard-tab-claimed',
  templateUrl: './dashboard-tab-claimed.component.html',
  styleUrls: ['./dashboard-tab-claimed.component.scss'],
  animations: fuseAnimations
})
export class DashboardTabClaimedComponent implements OnInit, OnDestroy, AfterViewInit {
  appEndpoint: string;
  claims: any;

  listUsers = [];
  selectableLabels = true;
  removableLabels = true;

  filteredLabels: Observable<any[]>;
  labels: any[];
  listLabels: any[];
  displayLabels: any[];
  labelIds: any[];

  user: string;

  auth;

  badges: DashboardBadge[];

  badgeId;

  actives: any;

  showOrHidden = 'show';
  labelFilterForm: FormGroup;

  @ViewChild('labelInput') labelInput: ElementRef<HTMLInputElement>;
  @ViewChild('labelAuto') badgeMatAutocomplete: MatAutocomplete;

  labelCtrl = new FormControl();

  @Select(AuthState.auth) auth$: Observable<any>;

  @Select(DashboardState.claims) claims$: Observable<any>;

  @Output() totalMyBadges = new EventEmitter<number>();

  private _unsubscribeAll: Subject<any>;

  constructor(
    private _badgeService: BadgeService,
    private _store: Store,
    private _dialog: MatDialog,
    private _formBuilder: FormBuilder
  ) {
    this.appEndpoint = environment.appEndpoint;
    this._unsubscribeAll = new Subject();
    this.claims = [];
    this.labels = [];
    this.listLabels = [];
    this.displayLabels = [];
    this.labelIds = [];
  }

  ngOnInit(): void {
    this._store.dispatch(new DashboardClaims('active', { page: 1 }, null));
    this._onInitForm();
    this.getLabels();

    this.claims$
      .pipe(takeUntil(this._unsubscribeAll))
      .subscribe((claims) => {
        this.claims = claims.data;

        if (this.claims) {
          this.totalMyBadges.emit(this.claims.length || 0);
        }
      });

    this.auth$
      .pipe(takeUntil(this._unsubscribeAll))
      .subscribe((auth) => {
        this.auth = auth;
      });
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

        this._store.dispatch(new DashboardClaims('active', { page: 1 }, reportFormValues));
      }

      this.claims$
        .pipe(takeUntil(this._unsubscribeAll))
        .subscribe((claims) => {
          this.claims = claims.data;

          if (this.claims) {
            this.totalMyBadges.emit(this.claims.length || 0);
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

      this._store.dispatch(new DashboardClaims('active', { page: 1 }, reportFormValues));
    }

    this.claims$
      .pipe(takeUntil(this._unsubscribeAll))
      .subscribe((claims) => {
        this.claims = claims.data;

        if (this.claims) {
          this.totalMyBadges.emit(this.claims.length || 0);
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
  }
}