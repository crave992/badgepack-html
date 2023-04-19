import { Injectable } from '@angular/core';
import {
    HttpRequest,
    HttpHandler,
    HttpEvent,
    HttpInterceptor
} from '@angular/common/http';
import { Observable } from 'rxjs';
import { AuthService } from '../services/auth.service';

import { Store, Select } from '@ngxs/store';
import { AuthState } from 'app/shared/states/auth.state';

@Injectable()
export class AuthInterceptor implements HttpInterceptor {
    constructor(
        private _store: Store
    ) { }

    intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<unknown>> {
        const token = this._store.selectSnapshot(AuthState.token);

        if (token) {
            const newRequest = request.clone({
                setHeaders: {
                    Authorization: `Bearer ${token}`
                }
            });
            return next.handle(newRequest);
        }
        return next.handle(request);
    }
}
