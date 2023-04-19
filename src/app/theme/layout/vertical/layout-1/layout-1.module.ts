import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';

import { FuseSidebarModule } from '@fuse/components';
import { FuseSharedModule } from '@fuse/shared.module';

import { ContentModule } from 'app/theme/layout/components/content/content.module';
import { FooterModule } from 'app/theme/layout/components/footer/footer.module';
import { NavbarModule } from 'app/theme/layout/components/navbar/navbar.module';
import { QuickPanelModule } from 'app/theme/layout/components/quick-panel/quick-panel.module';
import { ToolbarModule } from 'app/theme/layout/components/toolbar/toolbar.module';

import { VerticalLayout1Component } from 'app/theme/layout/vertical/layout-1/layout-1.component';

@NgModule({
    declarations: [
        VerticalLayout1Component
    ],
    imports     : [
        RouterModule,

        FuseSharedModule,
        FuseSidebarModule,

        ContentModule,
        FooterModule,
        NavbarModule,
        QuickPanelModule,
        ToolbarModule
    ],
    exports     : [
        VerticalLayout1Component
    ]
})
export class VerticalLayout1Module
{
}
