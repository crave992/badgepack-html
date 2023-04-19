import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { FuseSharedModule } from '@fuse/shared.module';
import { FuseDemoModule } from '@fuse/components/demo/demo.module';

import { SharedModule } from 'app/shared/modules/shared.module';
import { FuseSidebarModule } from '@fuse/components';
import { QRCodeModule } from 'angularx-qrcode';

import { BadgesComponent } from 'app/applications/badges/badges.component';

import { BadgesListComponent } from './badges-list/badges-list.component';
import { BadgesFormComponent } from './badges-form/badges-form.component';
import { BadgesFormClaimedComponent } from './badges-form/badges-form-claimed/badges-form-claimed.component';
import { BadgesFormChecklistComponent } from './badges-form/badges-form-checklist/badges-form-checklist.component';
import { BadgesMainSidebarComponent } from './sidebars/badges-main-sidebar/badges-main-sidebar.component';
import { NgxMaterialTimepickerModule } from 'ngx-material-timepicker';
import { NgxMatSelectSearchModule } from 'ngx-mat-select-search';
import { NgxMatDatetimePickerModule, NgxMatTimepickerModule, } from '@angular-material-components/datetime-picker';
import { BadgesDetailComponent } from './badges-detail/badges-detail.component';
import { BadgesFormAssignComponent } from './badges-form/badges-form-assign/badges-form-assign.component';
import { NgxEditorModule } from 'ngx-editor';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from "@angular/material/form-field";
import { EditorModule } from "@tinymce/tinymce-angular";

const routes: Routes = [
    {
        path: '',
        component: BadgesComponent,
        children: [
            {
                path: '',
                component: BadgesListComponent
            },
            {
                path: 'active',
                component: BadgesListComponent
            },
            {
                path: 'inactive',
                component: BadgesListComponent
            },
            {
                path: 'create',
                component: BadgesFormComponent
            },
            {
                path: ':id/edit',
                component: BadgesFormComponent
            },
            {
                path: ':id/detail',
                component: BadgesDetailComponent
            }
        ]

    },
];

@NgModule({
    declarations: [
        BadgesComponent,
        BadgesMainSidebarComponent,
        BadgesListComponent,
        BadgesFormComponent,
        BadgesFormClaimedComponent,
        BadgesFormAssignComponent,
        BadgesDetailComponent,
        BadgesFormChecklistComponent
    ],
    imports: [
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
        NgxEditorModule,
        MatFormFieldModule,
        MatInputModule,
        EditorModule
    ],
    entryComponents: [

    ]
})
export class BadgesModule {
}
