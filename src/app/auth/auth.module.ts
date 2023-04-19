import { NgModule } from '@angular/core';

import { LoginModule } from 'app/auth/login/login.module';
import { ForgotPasswordModule } from 'app/auth/forgot-password/forgot-password.module';
import { ResetPasswordModule } from 'app/auth/reset-password/reset-password.module';


@NgModule({
    imports: [
        // Authentication
        LoginModule,
        ForgotPasswordModule,
        ResetPasswordModule
    ]
})
export class AuthModule
{

}
