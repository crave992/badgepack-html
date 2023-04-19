import { Component, ViewEncapsulation, OnInit, OnDestroy } from '@angular/core';
import { Observable, Subject } from 'rxjs';

import { fuseAnimations } from '@fuse/animations';

import { Select, Store } from '@ngxs/store';
import { GetUser } from 'app/shared/states/user.actions';
import { AuthState } from 'app/shared/states/auth.state';
import { UserState } from 'app/shared/states/user.state';
import { takeUntil } from 'rxjs/operators';
import { User } from 'app/shared/models/user.model';

@Component({
    selector: 'my-profile',
    templateUrl: './my-profile.component.html',
    styleUrls: ['./my-profile.component.scss'],
    encapsulation: ViewEncapsulation.None,
    animations: fuseAnimations,
})
export class MyProfileComponent implements OnInit, OnDestroy {
    auth;
    // Private
    private _unsubscribeAll: Subject<any>;

    @Select(AuthState.auth) auth$: Observable<any>;

    @Select(UserState.current) user$: Observable<any>;

    constructor(private _store: Store) {
        // Set the private defaults
        this._unsubscribeAll = new Subject();
    }

    ngOnInit(): void {
        this.auth$.pipe(takeUntil(this._unsubscribeAll)).subscribe((auth) => {
            this.auth = auth;
        });

        this._store.dispatch(new GetUser(this.auth.id));

        this.user$.pipe(takeUntil(this._unsubscribeAll)).subscribe((user) => {
            this.auth = user;
        });
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
