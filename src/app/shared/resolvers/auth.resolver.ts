import { Injectable } from '@angular/core';
import { Router, Resolve, RouterStateSnapshot, ActivatedRouteSnapshot } from '@angular/router';

import { Observable, throwError } from 'rxjs';
import { map, catchError } from 'rxjs/operators';

import { FuseNavigationService } from '../../../@fuse/components/navigation/navigation.service';

import { AuthService } from '../services/auth.service';

import { Store, Select } from '@ngxs/store';
import { RefreshAuth } from 'app/shared/states/auth.actions';
import { AuthState } from 'app/shared/states/auth.state';

@Injectable({ providedIn: 'root' })
export class AuthResolver implements Resolve<any> {
    @Select(AuthState.auth) auth$: Observable<any>;

    constructor(
        private _router: Router,
        private _authService: AuthService,
        private _fuseNavigationService: FuseNavigationService,
        private _store: Store
    ) { }

    resolve(_route: ActivatedRouteSnapshot, _state: RouterStateSnapshot): Observable<any> | Promise<any> | any {

        return new Promise((resolve, reject) => {
            Promise.all([
                this._store.dispatch( new RefreshAuth() )
            ]).then(
                (response) => {
                    this.auth$.subscribe((auth) => {
                        if (auth) {
                            if (!this._authService.canRole(auth, 'admin')) {
                                this._fuseNavigationService.removeNavigationItem('groups');
                            }
                            if (!this._authService.canRole(auth, 'manage')) {
                                this._fuseNavigationService.removeNavigationItem('management');
                                this._fuseNavigationService.removeNavigationItem('reports');
                                this._fuseNavigationService.removeNavigationItem('report-badge-credited');
                                this._fuseNavigationService.removeNavigationItem('report-badge-redeemed');
                                this._fuseNavigationService.removeNavigationItem('report-users');
    
                                this._fuseNavigationService.removeNavigationItem('applications');
                                this._fuseNavigationService.removeNavigationItem('badges');
                            }
                            
                        }
                    }).unsubscribe();
                    resolve(true);
                },
                reject
            );
        });
    }
}
