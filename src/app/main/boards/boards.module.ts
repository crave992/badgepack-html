import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { FuseSharedModule } from '@fuse/shared.module';
import { FuseSidebarModule } from '@fuse/components';
import { FuseWidgetModule } from '@fuse/components/widget/widget.module';
import { SharedModule } from 'app/shared/modules/shared.module';

import { BoardsComponent } from 'app/main/boards/boards.component';
import { QRCodeModule } from 'angularx-qrcode';
import { MatIconModule} from '@angular/material/icon';
import { BoardsListViewComponent } from './boards-list-view/boards-list-view.component';
import { BoardsItemViewComponent } from './boards-item-view/boards-item-view.component';

const routes: Routes = [
    {
        path     : '',
        component: BoardsComponent,
        children: [
            {
                path : '',
                component: BoardsListViewComponent
            },
            {
                path : ':id/view',
                component: BoardsItemViewComponent
            },
            
        ]
    },
    
];

@NgModule({
    declarations: [
        BoardsComponent,
        BoardsListViewComponent,
        BoardsItemViewComponent
    ],
    imports     : [
        RouterModule.forChild(routes),

        FuseSharedModule,
        FuseSidebarModule,
        FuseWidgetModule,
        SharedModule,
        QRCodeModule,
        MatIconModule
    ],
    entryComponents: [
    ]
})
export class BoardsModule
{
}

