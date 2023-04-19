import { Component, OnDestroy, OnInit, ViewEncapsulation, HostBinding, ElementRef, ViewChild, AfterViewInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, FormControl } from '@angular/forms';
import { Subject, Observable } from 'rxjs';
import { takeUntil, map, startWith } from 'rxjs/operators';
import { ActivatedRoute, Params, Route, Router } from '@angular/router';

import { fuseAnimations } from '@fuse/animations';

import { Badge } from 'app/shared/models/badge.model';

import { GlobalService } from 'app/shared/services/global.service';

import { MatDialog } from '@angular/material/dialog';

import { SharedConfirmationDialogComponent } from 'app/shared/dialogs/shared-confirmation-dialog/shared-confirmation-dialog.component';

import { MatAutocomplete, MatAutocompleteSelectedEvent } from '@angular/material/autocomplete';
import { GroupService } from 'app/shared/services/group.service';

import { BadgeService } from 'app/shared/services/badge.service';


import * as moment from 'moment';
import { PageEvent } from '@angular/material/paginator';
import { FuseConfigService } from '@fuse/services/config.service';

@Component({
    selector: 'app-boards-item-view',
    templateUrl: './boards-item-view.component.html',
    styleUrls: ['./boards-item-view.component.scss'],
    encapsulation: ViewEncapsulation.None,
    animations: fuseAnimations
})
export class BoardsItemViewComponent implements OnInit, OnDestroy, AfterViewInit {
    @HostBinding('class') classes = 'center';
    badge: Badge;
    badges = [];
    pageSlice = [];
    filterValue: string;
    activeCount: number;
    inactiveCount: number;
    badgeId: any;
    self_page: boolean;

    filteredBadges: any;
    filterStatus: string;
    pageSize: any;
    // Private
    private _unsubscribeAll: Subject<any>;
    subs: any;

    @ViewChild('filter', { static: true })
    filter: ElementRef;

    /**
     * Constructor
     *
     * @param {FormBuilder} _formBuilder
     */
    constructor(
        private _fuseConfigService: FuseConfigService,
        private _globalService: GlobalService,
        private _groupService: GroupService,
        private _badgeService: BadgeService,
        private _activatedRoute: ActivatedRoute,
        private _dialog: MatDialog,
        private _router: ActivatedRoute,
        private _route: Router
    ) {
        this.badges = [];

        this.self_page = true;

        if (this._route.url.indexOf('/badge/BG-') > -1 || this._route.url.indexOf('/badge/bg-') > -1) {
            this.self_page = false;
            this._fuseConfigService.config = {
                layout: {
                    navbar: {
                        hidden: true
                    },
                    toolbar: {
                        hidden: true
                    },
                
                }
            };
        }    

        this.filterValue = '';

        // Set the private defaults
        this._unsubscribeAll = new Subject();
    }

    /**
     * On init
     */
    ngOnInit(): void {
        this.filterStatus = 'active';
        this.activeCount = 0;
        this.inactiveCount = 0;
        this.pageSize = 250;
        this._activatedRoute.params
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe(
                (params: Params) => {
                    const id = params.id;
                    this.badgeId = params.id

                    if (id) {
                        this._badgeService.getBadge(id)
                            .pipe(takeUntil(this._unsubscribeAll))
                            .subscribe((badge) => {
                                if (badge && badge.status === 'success') {
                                    this.badge = badge.data;


                                    this.getBadgeBoard('active');
                                    this._globalService.ngxUiLoader();
                                }
                            });
                    }
                }
            );
            
    }

    onSubmit(field): void {
        this.filterStatus = field.value;
        if (this.filterValue === ''){
            this.getBadgeBoard(field.value);
        }
    }

    getBadgeBoard(status): void {
        if (this.badge) {
            this._badgeService.board(this.badge.id, status)
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe((badges) => {
                if (badges) {
                    this.badges = badges.data.data;
                    this.activeCount = 0;
                    this.inactiveCount = 0;
                    for (const userCount of this.badges) {
                        if (userCount.status === 'active') {
                               this.activeCount++;                            
                        } else if (userCount.status === 'inactive') {
                              this.inactiveCount++;
                        }                 
                    }
                    this.pageSlice = this.badges.slice(0, 250);
                    this._globalService.ngxUiLoader('stop');
                }

            });
        }
    }

    openDialog(action): void {

    }

    onPageChange(event: PageEvent): void {
        this.pageSize = event.pageSize;
        const startIndex = event.pageIndex * event.pageSize;
        let endIndex = startIndex + event.pageSize;
        if (endIndex > this.badges.length) {
          endIndex = this.badges.length;
        }
        this.pageSlice = this.badges.slice(startIndex, endIndex);
    }

    searchFilter(event: Event): void {
        const filterValue = (event.target as HTMLInputElement).value;
        if (filterValue === '' && this.filterStatus === 'all') {
            this.getBadgeBoard('all');
        }
        else if (filterValue === '' && this.filterStatus === 'active') {
            this.getBadgeBoard('active');
        }
        else if (filterValue === '' && this.filterStatus === 'inactive') {
            this.getBadgeBoard('inactive');
        }
        else {
            this.filteredBadges = this.badges.filter((user) => {
                return user.username.toLowerCase().includes(filterValue.toLowerCase());
            });
            this.pageSlice = this.filteredBadges.slice(0, this.pageSize);
        }
    }

    ngAfterViewInit(): void {

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
