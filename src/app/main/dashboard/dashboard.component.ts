import { Component, OnInit, ViewEncapsulation, OnDestroy } from '@angular/core';
import { fuseAnimations } from '@fuse/animations';

import { takeUntil } from 'rxjs/operators';
import { Observable, Subject } from 'rxjs';

import { BadgeService } from 'app/shared/services/badge.service';
import { GlobalService } from 'app/shared/services/global.service';

import { Store, Select } from '@ngxs/store';
import { AuthState } from 'app/shared/states/auth.state';
import { DashboardState } from 'app/shared/states/dashboard.state';

import { FuseSidebarService } from '@fuse/components/sidebar/sidebar.service';

@Component({
  selector: 'dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss'],
  encapsulation: ViewEncapsulation.None,
  animations: fuseAnimations,
})
export class DashboardComponent implements OnInit, OnDestroy {
  dateNow = Date.now();
  offers = [];
  auth;
  available: any;
  acquired: any;
  claims: any;
  expires: any;
  partials: any;

  totalMyAvailableBadges = 0;
  totalMyAcquiredBadges = 0;
  totalMyBadges = 0;
  totalMyExpiredBadges = 0;
  totalMyPartialBadges = 0;

  @Select(AuthState.auth) auth$: Observable<any>;
  @Select(DashboardState.available) available$: Observable<any>;
  @Select(DashboardState.acquired) acquired$: Observable<any>;
  @Select(DashboardState.claims) claims$: Observable<any>;
  @Select(DashboardState.expires) expires$: Observable<any>;
  @Select(DashboardState.partials) partials$: Observable<any>;

  private _unsubscribeAll: Subject<any>;

  constructor(
    private _globalService: GlobalService,
    private _badgeService: BadgeService,
    private _fuseSidebarService: FuseSidebarService,
    private _store: Store
  ) {
    this._unsubscribeAll = new Subject();
  }

  ngOnInit(): void {
    this._globalService.ngxUiLoader();

    this.auth$
      .pipe(takeUntil(this._unsubscribeAll))
      .subscribe((auth) => {
        if (auth) {
          this.auth = auth;
        }
      });

    this.available$
      .pipe(takeUntil(this._unsubscribeAll))
      .subscribe((available) => {
        if (available) {
          this.available = available;

          this._globalService.ngxUiLoader('stop');
        }
      });

    this.acquired$
      .pipe(takeUntil(this._unsubscribeAll))
      .subscribe((acquired) => {
        if (acquired) {
          this.acquired = acquired;

          this._globalService.ngxUiLoader('stop');
        }
      });

    this.claims$
      .pipe(takeUntil(this._unsubscribeAll))
      .subscribe((claims) => {
        if (claims) {
          this.claims = claims;

          this._globalService.ngxUiLoader('stop');
        }
      });

    this.expires$
      .pipe(takeUntil(this._unsubscribeAll))
      .subscribe((expires) => {
        if (expires) {
          this.expires = expires;

          this._globalService.ngxUiLoader('stop');
        }
      });

    this.partials$
      .pipe(takeUntil(this._unsubscribeAll))
      .subscribe((partials) => {
        if (partials) {
          this.partials = partials;

          this._globalService.ngxUiLoader('stop');
        }
      });

    this.getTotalMyAvailableBadges(this.available.total);
    this.getTotalMyAcquiredBadges(this.acquired.total);
    this.getTotalMyBadges(this.claims.total);
    this.getTotalMyExpiredBadges(this.expires.total);
    this.getTotalMyPartialBadges(this.partials.total);
  }

  getTotalMyAvailableBadges(total: number): void {
    if (total) {
      this.totalMyAvailableBadges = total;
    }
  }

  getTotalMyAcquiredBadges(total: number): void {
    if (total) {
      this.totalMyAcquiredBadges = total;
    }
  }

  getTotalMyBadges(total: number): void {
    if (total) {
      this.totalMyBadges = total;
    }
  }

  getTotalMyExpiredBadges(total: number): void {
    if (total) {
      this.totalMyExpiredBadges = total;
    }
  }

  getTotalMyPartialBadges(total: number): void {
    if (total) {
      this.totalMyPartialBadges = total;
    }
  }

  ngOnDestroy(): void {
    this._unsubscribeAll.next();
    this._unsubscribeAll.complete();
  }

  toggleSidebar(name): void {
    this._fuseSidebarService.getSidebar(name).toggleOpen();
  }
}