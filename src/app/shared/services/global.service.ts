import { Injectable } from '@angular/core';

import { AbstractControl } from '@angular/forms';

import { NgxUiLoaderService } from 'ngx-ui-loader';

import {
    MatSnackBar,
    MatSnackBarHorizontalPosition,
    MatSnackBarVerticalPosition,
} from '@angular/material/snack-bar';

@Injectable({
    providedIn: 'root'
})
export class GlobalService {

    private _horizontalPosition: MatSnackBarHorizontalPosition = 'start';
    private _verticalPosition: MatSnackBarVerticalPosition = 'top';

    constructor(
        private _snackBar: MatSnackBar,
        private _ngxUiLoaderService: NgxUiLoaderService
    ) { }

    validationPasswordMatch(AC: AbstractControl): any {
        const password = AC.get('password').value;
        const confirmPassword = AC.get('confirm_password').value;
        if (password && password !== confirmPassword) {
            AC.get('confirm_password').setErrors({ MatchPassword: true });
        } else {
            AC.get('confirm_password').setErrors(null);
            return null;
        }
    }

    openSnackBar(message): void {
        this._snackBar.open(message, 'Close', {
            duration: 500,
            horizontalPosition: this._horizontalPosition,
            verticalPosition: this._verticalPosition,
        });
    }

    ngxUiLoader(option = 'start', type = 'main', name = ''): void {
        if (type === 'sub' && name) {
            if (option === 'stop') {
            this._ngxUiLoaderService.stopLoader(name);
            } else {
            this._ngxUiLoaderService.startLoader(name);
            }
        } else {
            if (option === 'stop') {
            this._ngxUiLoaderService.stop();
            } else {
            this._ngxUiLoaderService.start();
            }
        }
    }
}
