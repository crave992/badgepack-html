import { NgModule } from '@angular/core';

import { Title, Meta } from '@angular/platform-browser';

import { FuseSharedModule } from '@fuse/shared.module';

import { NgxUiLoaderModule, NgxUiLoaderConfig } from 'ngx-ui-loader';

import { MaterialModule } from './material.module';
import { TimezoneDatePipe } from 'app/shared/pipes/timezone-date.pipe';
import { MatTableExporterModule } from 'mat-table-exporter';
import { SharedConfirmationDialogComponent } from 'app/shared/dialogs/shared-confirmation-dialog/shared-confirmation-dialog.component';
import { TimezonePhDatePipe } from '../pipes/timezone-ph.pipe';
import { EditorModule } from "@tinymce/tinymce-angular";
import { NgxEditorModule } from 'ngx-editor';

const ngxUiLoaderConfig: NgxUiLoaderConfig = {
    fgsColor: '#ffffff',
    fgsType: 'square-jelly-box',
    blur: 5,
    overlayColor: 'rgba(30, 30, 30, 0.8)',
    fgsSize: 80,
    minTime: 100,
    text: 'Loading...'
};

@NgModule({
    declarations: [
        TimezoneDatePipe,
        TimezonePhDatePipe,
        SharedConfirmationDialogComponent
    ],
    imports: [
        FuseSharedModule,
        MaterialModule,
        MatTableExporterModule,
        NgxUiLoaderModule.forRoot(ngxUiLoaderConfig)
    ],
    exports: [
        FuseSharedModule,
        MaterialModule,
        TimezoneDatePipe,
        TimezonePhDatePipe,
        MatTableExporterModule,
        SharedConfirmationDialogComponent,
        NgxUiLoaderModule,
        EditorModule,
        NgxEditorModule
    ],
    providers: [
        Title,
        Meta
    ],
    entryComponents: [
        SharedConfirmationDialogComponent
    ]
})
export class SharedModule { }
