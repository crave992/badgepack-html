import { Component, OnDestroy, OnInit, ViewEncapsulation, Query } from '@angular/core';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

import { FuseConfigService } from '@fuse/services/config.service';
import { fuseAnimations } from '@fuse/animations';
import { ActivatedRoute } from '@angular/router';

import { BadgeService } from 'app/shared/services/badge.service';

@Component({
    selector: 'badge-badge',
    templateUrl: './badge-badge.component.html',
    styleUrls: ['./badge-badge.component.scss'],
    encapsulation: ViewEncapsulation.None,
    animations: fuseAnimations
})
export class BadgeBadgeComponent implements OnInit, OnDestroy {
    badge: any;

    // Private
    private _unsubscribeAll: Subject<any>;

    constructor(
        private _fuseConfigService: FuseConfigService,
        private _activatedRoute: ActivatedRoute,
        private _badgeService: BadgeService
    ) {
        // Configure the layout
        this._fuseConfigService.config = {
            layout: {
                navbar: {
                    hidden: true
                },
                toolbar: {
                    hidden: true
                },
                footer: {
                    hidden: true
                },
                sidepanel: {
                    hidden: true
                }
            }
        };

        // Set the private defaults
        this._unsubscribeAll = new Subject();
    }

    // -----------------------------------------------------------------------------------------------------
    // @ Lifecycle hooks
    // -----------------------------------------------------------------------------------------------------

    /**
     * On init
     */
    ngOnInit(): void {
        this._activatedRoute.params
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe(
                (params: any) => {
                    const code = params.code;
                    if (code) {
                        this._badgeService.getBadge(code)
                            .pipe(takeUntil(this._unsubscribeAll))
                            .subscribe((response) => {
                                if (response && response.status === 'success') {
                                    this.badge = response.data;
                                }
                            });
                    }
                }
            );
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

