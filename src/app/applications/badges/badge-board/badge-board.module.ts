import { BadgesDetailComponent } from './../badges-detail/badges-detail.component';
import { NgModule } from '@angular/core';
import { Router, RouterModule, Routes } from '@angular/router';

import { FuseSharedModule } from '@fuse/shared.module';
import { FuseDemoModule } from '@fuse/components/demo/demo.module';

import { SharedModule } from 'app/shared/modules/shared.module';
import { FuseSidebarModule } from '@fuse/components';
import { QRCodeModule } from 'angularx-qrcode';

import { BadgesComponent } from 'app/applications/badges/badges.component';
import { NgxMatDatetimePickerModule, NgxMatTimepickerModule } from '@angular-material-components/datetime-picker';
import { BoardsItemViewComponent } from 'app/main/boards/boards-item-view/boards-item-view.component';
import { NgxMatSelectSearchModule } from 'ngx-mat-select-search';
import { NgxMaterialTimepickerModule } from 'ngx-material-timepicker';
import { BadgeBoardComponent } from './badge-board.component';

    const routes: Routes = [ 
        {
            path     : '',
            component: BadgeBoardComponent,
            children : [
                {
                    path : ':id',
                    component: BoardsItemViewComponent
                },
            ],    
        },
        {
            path : 'issued/:id',
            component: BadgesDetailComponent
        },
    ];


@NgModule({
    declarations: [
        BadgeBoardComponent,
    ],
    imports     : [
        RouterModule.forChild(routes),

        FuseSidebarModule,
        FuseSharedModule,
        FuseDemoModule,
        QRCodeModule,
        SharedModule,
        NgxMaterialTimepickerModule,
        NgxMatDatetimePickerModule,
        NgxMatTimepickerModule,
        NgxMatSelectSearchModule,
    ],
    entryComponents: [
        
    ]
})
export class BadgeBoardModule
{
    BGroute = true;
    constructor(
        private _route: Router
    ) {
        if (this._route.url.indexOf('/badge/BG-') > -1 || this._route.url.indexOf('/badge/bg-') > -1) {
            this.BGroute = true;
        } else if (this._route.url.indexOf('/badge/BI-') > -1 || this._route.url.indexOf('/badge/bi-') > -1) {
            this.BGroute = false;
        }   
    }
}
