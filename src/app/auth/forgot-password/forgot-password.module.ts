import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';

import { FuseSharedModule } from '@fuse/shared.module';
import { SharedModule } from 'app/shared/modules/shared.module';

import { ForgotPasswordComponent } from 'app/auth/forgot-password/forgot-password.component';

const routes = [
    {
        path     : 'forgot-password',
        component: ForgotPasswordComponent
    }
];

@NgModule({
    declarations: [
        ForgotPasswordComponent
    ],
    imports     : [
        RouterModule.forChild(routes),

        FuseSharedModule,
        SharedModule
    ]
})
export class ForgotPasswordModule
{
}
