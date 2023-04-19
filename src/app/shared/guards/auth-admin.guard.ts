import { ActivatedRouteSnapshot, RouterStateSnapshot, CanActivate, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { Injectable } from '@angular/core';

import { Store, Select } from '@ngxs/store';
import { AuthState } from 'app/shared/states/auth.state';

@Injectable({ providedIn: 'root' })
export class AuthAdminGuard implements CanActivate {

    constructor(private _authService: AuthService, private _router: Router, private _store: Store) { }

    canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): boolean {
        const auth = this._store.selectSnapshot(AuthState.auth);

        if (!auth || auth.role !== 'admin') {
            this._router.navigate(['/dashboard'], {});
            return false;
        }

        return true;
    }
}

