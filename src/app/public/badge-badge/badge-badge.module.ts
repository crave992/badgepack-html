import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';

import { FuseSharedModule } from '@fuse/shared.module';
import { SharedModule } from 'app/shared/modules/shared.module';

import { BadgeBadgeComponent } from 'app/public/badge-badge/badge-badge.component';

import { QRCodeModule } from 'angularx-qrcode';

const routes = [
    {
        path     : 'badge/:code/badge',
        component: BadgeBadgeComponent
    }
];

@NgModule({
    declarations: [
        BadgeBadgeComponent
    ],
    imports     : [
        RouterModule.forChild(routes),

        FuseSharedModule,
        SharedModule,
        QRCodeModule
    ]
})
export class BadgeBadgeModule
{
}
