import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';

import { FuseSharedModule } from '@fuse/shared.module';
import { SharedModule } from 'app/shared/modules/shared.module';

import { ResetPasswordComponent } from 'app/auth/reset-password/reset-password.component';

const routes = [
    {
        path     : 'reset-password',
        component: ResetPasswordComponent
    }
];

@NgModule({
    declarations: [
        ResetPasswordComponent
    ],
    imports     : [
        RouterModule.forChild(routes),

        FuseSharedModule,
        SharedModule
    ]
})
export class ResetPasswordModule
{
}
