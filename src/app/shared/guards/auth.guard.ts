import { ActivatedRouteSnapshot, RouterStateSnapshot, CanActivate, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { Injectable } from '@angular/core';

import { Store, Select } from '@ngxs/store';
import { AuthState } from 'app/shared/states/auth.state';

@Injectable({ providedIn: 'root' })
export class AuthGuard implements CanActivate {

    constructor(private _authService: AuthService, private _router: Router, private _store: Store) { }

    canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): boolean {
        const logged = this._store.selectSnapshot(AuthState.logged);

        if (!logged) {
            this._router.navigate(['/auth/login'], {});
            return false;
        }

        return true;
    }
}
