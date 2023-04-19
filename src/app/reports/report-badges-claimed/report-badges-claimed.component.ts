import { group } from '@angular/animations';
import { Component, OnInit, OnDestroy, AfterViewInit, ElementRef, ViewChild } from '@angular/core';
import { FormGroup, FormBuilder, FormControl, Validators } from '@angular/forms';
import { Subject, timer, Observable } from 'rxjs';
import { takeUntil, map, startWith } from 'rxjs/operators';

import { MatTableDataSource } from '@angular/material/table';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';

import { FuseSidebarService } from '@fuse/components/sidebar/sidebar.service';

import { GroupService } from 'app/shared/services/group.service';
import { BadgeService } from 'app/shared/services/badge.service';
import { ReportService } from 'app/shared/services/report.service';

import * as moment from 'moment';
import { MatAutocomplete, MatAutocompleteSelectedEvent } from '@angular/material/autocomplete';
import { MatDatepickerInputEvent } from '@angular/material/datepicker';

@Component({
    selector: 'report-badges-claimed',
    templateUrl: './report-badges-claimed.component.html',
    styleUrls: ['./report-badges-claimed.component.scss']
})
export class ReportBadgesClaimedComponent implements OnInit, OnDestroy, AfterViewInit {
    badgeList = [];
    groupList = [];
    userGroupList = [];
    filteredGroups: Observable<any[]>;
    filteredBadges: Observable<any[]>;
    filteredUserGroups: Observable<any[]>;

    dateFrom: any;
    dateTo: any;
    tomorrow: any;
    minDate: any;
    startDate: any;
    endDate: any;

    badges: any[];
    displayBadges: any[];
    badgeIds: any[];

    groups: any[];
    displayGroups: any[];
    groupIds: any[];

    userGroups: any[];
    displayUserGroups: any[];
    userGroupIds: any[];

    fileType: any;
    visible = true;
    selectableBadges = true;
    removableBadges = true;
    selectableGroups = true;
    removableGroups = true;
    selectableUserGroups = true;
    removableUserGroups = true;
    type = 'issued';
    sortActive = 'issuance_date';
    direct = 'desc';

    reportForm: FormGroup;

    reports = new MatTableDataSource([]);

    @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;

    @ViewChild(MatSort, { static: true }) sort: MatSort;

    @ViewChild('badgeInput') badgeInput: ElementRef<HTMLInputElement>;
    @ViewChild('badgeAuto') badgeMatAutocomplete: MatAutocomplete;
    @ViewChild('groupInput') groupInput: ElementRef<HTMLInputElement>;
    @ViewChild('groupAuto') groupMatAutocomplete: MatAutocomplete;
    @ViewChild('userGroupInput') userGroupInput: ElementRef<HTMLInputElement>;
    @ViewChild('userGroupAuto') userGroupMatAutocomplete: MatAutocomplete;


    badgeCtrl = new FormControl();
    groupCtrl = new FormControl();
    userGroupCtrl = new FormControl();

    tableColumns = ['csid', 'name', 'badge_name', 'issuance_date', 'expiry_date', 'application'];

    // Private
    private _unsubscribeAll: Subject<any>;
    
    constructor(
        private _groupService: GroupService,
        private _badgeService: BadgeService,
        private _reportService: ReportService,
        private _formBuilder: FormBuilder,
        private _fuseSidebarService: FuseSidebarService
    ) {
        // Set the private defaults
        this._unsubscribeAll = new Subject();
        this.badges = [{id: 'all', name: 'ALL BADGES'}];
        this.displayBadges = [];
        this.badgeIds = [];
        this.groups = [{id: 'all', name: 'All Groups'}];
        this.displayGroups = [];
        this.groupIds = [];
        this.userGroups = [{id: 'all', name: 'All Groups'}];
        this.displayUserGroups = [];
        this.userGroupIds = [];
        this.fileType = 'Issued Badges';
        this.type = 'issued';
    }

    ngOnInit(): void {
        this.dateFrom = moment().format();
        this.dateTo = moment().format();
        this.tomorrow = moment().format();
        this.minDate = moment().format();

        this.reports.paginator = this.paginator;
        this.reports.sort = this.sort;

        this._groupService.getList()
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe((response) => {
                if (response && response.status === 'success') {
                    this.groupList = response.data;
                    this.userGroupList = response.data;
                }
            });

        this._badgeService.getList()
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe((response) => {
                if (response && response.status === 'success') {
                    this.badgeList = response.data;
                }
            });

        this._onInitForm();
        this.badgeIds.push('all');
        this.groupIds.push('all');
        this.userGroupIds.push('all');
        this.reportForm.patchValue({
            badgeIds: this.badgeIds,
            groupIds: this.groupIds,
            userGroupIds: this.userGroupIds

        });
    }

    private _onInitForm(): void {

        this.reportForm = this._formBuilder.group({
            type: ['issued', Validators.required],
            badgeIds: ['',  Validators.required],
            groupIds: ['',  Validators.required],
            userGroupIds: ['',  Validators.required],
            dateFrom: [this.dateFrom, Validators.required],
            dateTo: [this.dateTo, Validators.required]
        });
    }

    onSubmit(): void {
        if (this.reportForm.valid) {
            const reportFormValues = this.reportForm.value;

            this.type = reportFormValues.type;
            reportFormValues.dateFrom = moment(reportFormValues.dateFrom).format('YYYY-MM-DD');
            reportFormValues.dateTo = moment(reportFormValues.dateTo).format('YYYY-MM-DD');
            this.startDate = moment(reportFormValues.dateFrom).format('DD-MMM-YYYY');
            this.endDate = moment(reportFormValues.dateTo).format('DD-MMM-YYYY');
            
            this._reportService.badges(reportFormValues)
                .pipe(takeUntil(this._unsubscribeAll))
                .subscribe((response) => {
                    if (response && response.status === 'success') {
                        this.reports = new MatTableDataSource(response.data);

                        this.reports.paginator = this.paginator;
                        this.reports.sort = this.sort;
                        
                    }
                });

        }
    }

    removeBadge(badge: any): void {
        const index = this.badges.indexOf(badge);
        
        if (index >= 0) {
            this.badges.splice(index, 1);
            this.badgeIds.splice(index, 1);

            this.reportForm.patchValue({ badgeIds: this.badgeIds });

            this._filterBadges('');
        }

    }

    removeGroup(badgeGroup: any): void {
        const index = this.groups.indexOf(badgeGroup);
        
        if (index >= 0) {
            this.groups.splice(index, 1);
            this.groupIds.splice(index, 1);

            this.reportForm.patchValue({ groupIds: this.groupIds });

            this._filterGroups('');
        }

    }

    removeUserGroup(userGroup: any): void {
        const index = this.userGroups.indexOf(userGroup);
        
        if (index >= 0) {
            this.userGroups.splice(index, 1);
            this.userGroupIds.splice(index, 1);

            this.reportForm.patchValue({ userGroupIds: this.userGroupIds });

            this._filterUserGroups('');
        }

    }


    selectedBadge(event: MatAutocompleteSelectedEvent): void {
        this.badges.push(event.option.value);
        this.badgeIds.push(event.option.value.id);

        this.badgeInput.nativeElement.value = '';
        this.badgeCtrl.setValue('');
        this.reportForm.patchValue({ badgeIds: this.badgeIds });

        if (event.option.value.id === 'all') {
            this.displayBadges = [];
        }
        
        if (this.badgeList[0].id === 'all' && event.option.value.id  !== 'all') {
            this.displayBadges.splice(0, 1);
            this.badgeList.splice(0, 1);
        }

        this._filterGroups('');
    }

    selectedGroup(event: MatAutocompleteSelectedEvent): void {
        this.groups.push(event.option.value);
        this.groupIds.push(event.option.value.id);

        this.groupInput.nativeElement.value = '';
        this.groupCtrl.setValue('');
        this.reportForm.patchValue({ groupIds: this.groupIds });

        if (event.option.value.id === 'all') {
            this.displayGroups = [];
        }

        if (this.groupList[0].id === 'all' && event.option.value.id  !== 'all') {
            this.displayGroups.splice(0, 1);
            this.groupList.splice(0, 1);
        }

        this._filterGroups('');
    }

    selectedUserGroup(event: MatAutocompleteSelectedEvent): void {
        this.userGroups.push(event.option.value);
        this.userGroupIds.push(event.option.value.id);

        this.userGroupInput.nativeElement.value = '';
        this.userGroupCtrl.setValue('');
        this.reportForm.patchValue({ userGroupIds: this.userGroupIds });

        if (event.option.value.id === 'all') {
            this.displayUserGroups = [];
        }

        if (this.userGroupList[0].id === 'all' && event.option.value.id  !== 'all') {
            this.displayUserGroups.splice(0, 1);
            this.userGroupList.splice(0, 1);
        }

        this._filterUserGroups('');
    }

    addBadge(event): void{
        this.filteredBadges.pipe(takeUntil(this._unsubscribeAll)).subscribe((e) => {});
    }

    private _filterBadges(value: any): any {
        if (this.badges.length === 0 || this.badges[0].id !== 'all') {
            if (this.badgeList[0].id !== 'all' && this.badges.length === 0 ) {
                this.badgeList.splice(0, 0, {id: 'all', name: 'ALL BADGES'});   
            }
            if (typeof value === 'string') {
               const filterValue = value.toLowerCase();
               return this.displayBadges = this.badgeList.filter((badge) => {
                  const sBadge = this.badges.slice().find((b) => {
                     return b.id === badge.id;
                   });

                  const badgeName = badge?.name.toLowerCase();

                  return !sBadge && (badgeName.indexOf(filterValue) >= 0);
              });
          }
            return [];
        } 
    }

    addGroup(event): void{
        this.filteredGroups.pipe(takeUntil(this._unsubscribeAll)).subscribe((e) => {});
    }

    private _filterGroups(value: any): any {
      if (this.groups.length === 0 || this.groups[0].id !== 'all') {
        if (this.groupList[0].id !== 'all' && this.groups.length === 0 ) {
            this.groupList.splice(0, 0, {id: 'all', name: 'ALL GROUPS'});   
        }
        if (typeof value === 'string') {
            const filterValue = value.toLowerCase();
            return this.displayGroups = this.groupList.filter((badgeGroup) => {
                const sGroup = this.groups.slice().find((u) => {
                    return u.id === badgeGroup.id;
                });

                if (badgeGroup.id !== 'all') {

                  const groupCode = badgeGroup?.code.toLowerCase();
                  const groupName = badgeGroup?.name.toLowerCase();

                  return !sGroup && (groupName.indexOf(filterValue) >= 0 || groupCode.indexOf(filterValue) >= 0);
                } else {
                    const groupName = group?.name.toLowerCase();

                    return !sGroup && (groupName.indexOf(filterValue) >= 0);
                }
            });
        }
        return [];
      }
    }

    addUserGroup(event): void{
        this.filteredUserGroups.pipe(takeUntil(this._unsubscribeAll)).subscribe((e) => {});
    }
    
    private _filterUserGroups(value: any): any {
      if (this.userGroups.length === 0 || this.userGroups[0].id !== 'all') {
        if (this.userGroupList[0].id !== 'all' && this.userGroups.length === 0 ) {
            this.userGroupList.splice(0, 0, {id: 'all', name: 'ALL GROUPS'});   
        }
        if (typeof value === 'string') {
            const filterValue = value.toLowerCase();
            return this.displayUserGroups = this.userGroupList.filter((userGroup) => {
                const sGroup = this.userGroups.slice().find((u) => {
                    return u.id === userGroup.id;
                });

                if (userGroup.id !== 'all') {

                  const groupCode = userGroup?.code.toLowerCase();
                  const groupName = userGroup?.name.toLowerCase();

                  return !sGroup && (groupName.indexOf(filterValue) >= 0 || groupCode.indexOf(filterValue) >= 0);
                } else {
                    const groupName = userGroup?.name.toLowerCase();

                    return !sGroup && (groupName.indexOf(filterValue) >= 0);
                }
            });
        }
        return [];
      }
    }
    
    private _filter(value: string): string[] {
        const filterValue = value.toLowerCase();

        return this.badgeList.filter(user => user.toLowerCase().indexOf(filterValue) === 0);
    }

    toggleSidebar(name): void {
        this._fuseSidebarService.getSidebar(name).toggleOpen();
    }

    changeDate(type: string, event: MatDatepickerInputEvent<Date>): void {
        this.minDate = event.value;
    }

    changeType($event): void {
        this.reports = new MatTableDataSource([]);
        this.reports.paginator = this.paginator;
        this.reports.sort = this.sort;
        if ($event.value === 'issued') {
            this.fileType = 'Issued Badges';
            this.tableColumns = ['csid', 'name', 'badge_name', 'issuance_date', 'expiry_date', 'application'];
            this.sortActive = 'issuance_date';
            this.direct = 'desc';
        } else if ($event.value === 'expired') {
            this.fileType = 'Expired Badges';
            this.tableColumns = ['csid', 'name', 'badge_name', 'issuance_date', 'expiry_date', 'application'];
            this.sortActive = 'expiry_date';
            this.direct = 'desc';
        } else if ($event.value === 'soon-to-expire') {
            this.fileType = 'Soon to Expire Badges';
            this.tableColumns = ['status', 'expiry_date', 'csid', 'name', 'badge_name', 'issuance_date'];
            this.sortActive = 'expiry_date';
            this.direct = 'asc';
        } else {
            this.fileType = 'Absense of data Badges';
            this.tableColumns = ['csid', 'name', 'badge_name', 'date'];
            this.sortActive = 'date';
            this.direct = 'desc';
        }
        
    }

    ngAfterViewInit(): void {
        this.filteredBadges = this.badgeCtrl.valueChanges.pipe(
            startWith(''),
            map((badge: string | '') => {
                return this._filterBadges(badge);
            })
        );

        this.filteredBadges
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe((e) => { });

        this.filteredGroups = this.groupCtrl.valueChanges.pipe(
                startWith(''),
                map((badgeGroup: string | '') => {
                    return this._filterGroups(badgeGroup);
                })
            );
    
        this.filteredGroups
                .pipe(takeUntil(this._unsubscribeAll))
                .subscribe((e) => { });     

        this.filteredUserGroups = this.userGroupCtrl.valueChanges.pipe(
                    startWith(''),
                    map((userGroup: string | '') => {
                        return this._filterUserGroups(userGroup);
                    })
                );
        
        this.filteredUserGroups
                    .pipe(takeUntil(this._unsubscribeAll))
                    .subscribe((e) => { });     

    }

    /**
     * On destroy
     */
    ngOnDestroy(): void {
        // Unsubscribe from all subscriptions
        this._unsubscribeAll.next();
        this._unsubscribeAll.complete();
    }

}
