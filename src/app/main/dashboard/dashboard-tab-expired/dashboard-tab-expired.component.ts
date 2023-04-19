import { Component, OnInit, OnDestroy, ViewChild, Output, EventEmitter, ElementRef, AfterViewInit } from '@angular/core';
import { fuseAnimations } from '@fuse/animations';

import { MatTableDataSource } from '@angular/material/table';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';

import { takeUntil, startWith, map } from 'rxjs/operators';
import { Subject, Observable } from 'rxjs';

import { Store, Select } from '@ngxs/store';
import { DashboardExpires } from 'app/shared/states/dashboard.actions';
import { DashboardState } from 'app/shared/states/dashboard.state';
import { BadgeService } from 'app/shared/services/badge.service';

import { environment } from 'environments/environment';

import { MatDialog } from '@angular/material/dialog';

import { AuthState } from 'app/shared/states/auth.state';
import { FormGroup, FormControl, FormBuilder } from '@angular/forms';
import { MatAutocomplete, MatAutocompleteSelectedEvent } from '@angular/material/autocomplete';

@Component({
    selector: 'dashboard-tab-expired',
    templateUrl: './dashboard-tab-expired.component.html',
    styleUrls: ['./dashboard-tab-expired.component.scss'],
    animations: fuseAnimations
})
export class DashboardTabExpiredComponent implements OnInit, OnDestroy, AfterViewInit {
    appEndpoint: string;
    expires: any;

    listUsers = [];
    selectableLabels = true;
    removableLabels = true;
    
    filteredLabels: Observable<any[]>;
    labels: any[];
    listLabels: any[];
    displayLabels: any[];
    labelExpiredIds: any[];

    user: string;

    auth;

    badges;

    actives: any;
    labelFilterExpiredForm: FormGroup;

    @ViewChild('labelInput') labelInput: ElementRef<HTMLInputElement>;
    @ViewChild('labelAuto') badgeMatAutocomplete: MatAutocomplete;

    labelCtrl = new FormControl();

    @Select(AuthState.auth) auth$: Observable<any>;

    @Select(DashboardState.expires) expires$: Observable<any>;

    @Output() totalMyExpiredBadges = new EventEmitter<number>();

    private _unsubscribeAll: Subject<any>;

    constructor(
        private _badgeService: BadgeService,
        private _store: Store,
        private _dialog: MatDialog,
        private _formBuilder: FormBuilder
    ) {
        this.appEndpoint = environment.appEndpoint;
        this.expires = [];
        // Set the private defaults
        this._unsubscribeAll = new Subject();
        this.labels = [];
        this.listLabels = [];
        this.displayLabels = [];
        this.labelExpiredIds = [];
    }

    ngOnInit(): void {
        this._store.dispatch(new DashboardExpires('expired', { page: 1 }, null));
        this._onInitForm();
        this.getLabels();
        
        this.expires$
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe((expires) => {
                this.expires = expires.data;

                if (this.expires) {
                    this.totalMyExpiredBadges.emit(this.expires.length || 0);
                }
            });

        this.auth$
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe((auth) => {
                this.auth = auth;
            });
    }

    openDialog(action, expire = null): void {
        
    }

    private _onInitForm(): void {
        this.labelFilterExpiredForm = this._formBuilder.group({
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
        // Unsubscribe from all subscriptions
        this._unsubscribeAll.next();
        this._unsubscribeAll.complete();
    }

    removeExpiredLabel(label: any): void {
        const index = this.labels.indexOf(label);
        if (index >= 0) {
            this.labels.splice(index, 1);
            this.labelExpiredIds.splice(index, 1);

            this.labelFilterExpiredForm.patchValue({ labelIds: this.labelExpiredIds });
            if (this.labelFilterExpiredForm.valid) {
                const reportFormValues = this.labelFilterExpiredForm.value;
            
                this._store.dispatch(new DashboardExpires('expired', { page: 1 }, reportFormValues ));
    
            }
               
            this.expires$
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe((expires) => {
                this.expires = expires.data;

                if (this.expires) {
                    this.totalMyExpiredBadges.emit(this.expires.length || 0);
                }
            });

            this._filterLabels('');
        }

    }

    selectedExpiredLabel(event: MatAutocompleteSelectedEvent): void {
        this.labels.push(event.option.value);
        this.labelExpiredIds.push(event.option.value.id);

        this.labelInput.nativeElement.value = '';
        this.labelCtrl.setValue('');
        this.labelFilterExpiredForm.patchValue({ labelIds: this.labelExpiredIds });
        if (this.labelFilterExpiredForm.valid) {
            const reportFormValues = this.labelFilterExpiredForm.value;
        
            this._store.dispatch(new DashboardExpires('expired', { page: 1 }, reportFormValues ));
        }
           
        this.expires$
        .pipe(takeUntil(this._unsubscribeAll))
        .subscribe((expires) => {
            this.expires = expires.data;

            if (this.expires) {
                this.totalMyExpiredBadges.emit(this.expires.length || 0);
            }
        });
        
        this.displayLabels.splice(0, 1);
        this._filterLabels('');
    }

    addLabel(event): void{
        this.filteredLabels.pipe(takeUntil(this._unsubscribeAll)).subscribe((e) => {});
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
                if (label) {}
                return this._filterLabels(label);
                 })
            );
    
        this.filteredLabels
                .pipe(takeUntil(this._unsubscribeAll))
                .subscribe((e) => {});
        }

}
