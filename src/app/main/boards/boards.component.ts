import { Component, OnInit, ViewEncapsulation, OnDestroy } from '@angular/core';
import { fuseAnimations } from '@fuse/animations';


import { takeUntil } from 'rxjs/operators';
import { Observable, Subject } from 'rxjs';

import { BadgeService } from 'app/shared/services/badge.service';
import { GlobalService } from 'app/shared/services/global.service';

import { Store, Select } from '@ngxs/store';
import { AuthState } from 'app/shared/states/auth.state';
import { DashboardClaims } from 'app/shared/states/dashboard.actions';
import { DashboardState } from 'app/shared/states/dashboard.state';

import { FuseSidebarService } from '@fuse/components/sidebar/sidebar.service';

import Swal from 'sweetalert2';

@Component({
    selector: 'boards',
    templateUrl: './boards.component.html',
    styleUrls: ['./boards.component.scss'],
    encapsulation: ViewEncapsulation.None,
    animations: fuseAnimations
})
export class BoardsComponent implements OnInit, OnDestroy {
    dateNow = Date.now();
    offers = [];
    auth;

    totalMyBadges = 0;
    totalMyExpiredBadges = 0;

    @Select(AuthState.auth) auth$: Observable<any>;

    private _unsubscribeAll: Subject<any>;
    /**
     * Constructor
     *
     * @param {FuseSidebarService} _fuseSidebarService
     * @param {BoardsService} _boardsBoardsService
     */
    constructor(
        private _globalService: GlobalService,
        private _badgeService: BadgeService,
        private _fuseSidebarService: FuseSidebarService,
        private _store: Store
    ) {
        // Set the private defaults
        this._unsubscribeAll = new Subject();
    }

    ngOnInit(): void {

        this.auth$
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe((auth) => {
                this.auth = auth;
            });
    }

    getTotalMyBadges(total: number): void {
        this.totalMyBadges = total;
    }

    getTotalMyExpiredBadges(total: number): void {
        this.totalMyExpiredBadges = total;
    }

    ngOnDestroy(): void {
        // Unsubscribe from all subscriptions
        this._unsubscribeAll.next();
        this._unsubscribeAll.complete();
    }

    toggleSidebar(name): void {
        this._fuseSidebarService.getSidebar(name).toggleOpen();
    }
}
