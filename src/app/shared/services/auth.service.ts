import { Injectable } from '@angular/core';

import { RequestService } from './request.service';
import { Observable } from 'rxjs';

import * as jwt_decode from 'jwt-decode';

@Injectable({
    providedIn: 'root'
})
export class AuthService {
    constructor(
        private _requestService: RequestService
    ) { }

    login(data: {}): Observable<any> {
        return this._requestService.post('auth/login', data);
    }

    loginSso(data: {}): Observable<any> {
        return this._requestService.post('auth/login/sso', data);
    }

    logout(): Observable<any> {
        return this._requestService.delete('auth/logout');
    }

    refresh(): Observable<any> {
        return this._requestService.get('auth/refresh');
    }

    canRole(user, action: string): boolean {
        let canRole = false;

        if (user) {
            const role = user.role.toLowerCase();

            switch (action.toLowerCase()) {
                case 'admin':
                    if (role === 'admin') {
                        canRole = true;
                    }
                    break;
                case 'manage':
                    if (['admin', 'manager', 'client'].includes(role)) {
                        canRole = true;
                    }
                    break;
                case 'member':
                    if (['admin', 'manager', 'client', 'member'].includes(role)) {
                        canRole = true;
                    }
                    break;
            }
        }


        return canRole;
    }

    check(token): boolean {
        const _token = jwt_decode(atob(token));

        if (!_token || !_token.exp) {
            return false;
        }

        const date = new Date(0);
        date.setUTCSeconds(_token.exp);

        const expiryDate = date;

        if (!expiryDate || !(expiryDate.valueOf() > new Date().valueOf())) {
            return false;
        }

        return true;
    }
}
