import { Component, OnInit, OnDestroy, AfterViewInit, ElementRef, ViewChild } from '@angular/core';
import { FormGroup, FormBuilder, FormControl, Validators } from '@angular/forms';
import { Subject, timer, Observable } from 'rxjs';
import { takeUntil, map, startWith } from 'rxjs/operators';

import { MatTableDataSource } from '@angular/material/table';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';

import { FuseSidebarService } from '@fuse/components/sidebar/sidebar.service';

import { GroupService } from 'app/shared/services/group.service';
import { ReportService } from 'app/shared/services/report.service';

import * as moment from 'moment';
import { GlobalService } from 'app/shared/services/global.service';

@Component({
  selector: 'app-report-users',
  templateUrl: './report-users.component.html',
  styleUrls: ['./report-users.component.scss']
})
export class ReportUsersComponent implements OnInit, OnDestroy {
    groupList = [];

    dateFrom: any;
    dateTo: any;

    reportForm: FormGroup;

    reports = new MatTableDataSource([]);

    @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;

    @ViewChild(MatSort, { static: true }) sort: MatSort;

    tableColumns = ['code', 'name', 'username', 'email', 'groups', 'role', 'status', 'created_at'];

    // Private
    private _unsubscribeAll: Subject<any>;
    
    constructor(
        private _groupService: GroupService,
        private _reportService: ReportService,
        private _formBuilder: FormBuilder,
        private _fuseSidebarService: FuseSidebarService,
        private _globalService: GlobalService
    ) {
        // Set the private defaults
        this._unsubscribeAll = new Subject();
    }

    ngOnInit(): void {
        this.dateFrom = moment().startOf('month').format();
        this.dateTo = moment().format();

        this.reports.paginator = this.paginator;
        this.reports.sort = this.sort;

        this._globalService.ngxUiLoader();

        this._groupService.getList()
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe((response) => {
                if (response && response.status === 'success') {
                    this.groupList = response.data;

                    this._globalService.ngxUiLoader('stop');
                }
            });

        this._onInitForm();
    }

    private _onInitForm(): void {
        this.reportForm = this._formBuilder.group({
            groupId: [''],
            dateFrom: [this.dateFrom, Validators.required],
            dateTo: [this.dateTo, Validators.required]
        });
    }

    onSubmit(): void {
        if (this.reportForm.valid) {
            const reportFormValues = this.reportForm.value;

            reportFormValues.dateFrom = moment(reportFormValues.dateFrom).format('YYYY-MM-DD');
            reportFormValues.dateTo = moment(reportFormValues.dateTo).format('YYYY-MM-DD');
            
            this._reportService.users(reportFormValues)
                .pipe(takeUntil(this._unsubscribeAll))
                .subscribe((response) => {
                    if (response && response.status === 'success') {
                        this.reports = new MatTableDataSource(response.data);

                        this.reports.paginator = this.paginator;
                        this.reports.sort = this.sort;
                    }
                });

        }
    }

    toggleSidebar(name): void {
        this._fuseSidebarService.getSidebar(name).toggleOpen();
    }

    /**
     * On destroy
     */
    ngOnDestroy(): void {
        // Unsubscribe from all subscriptions
        this._unsubscribeAll.next();
        this._unsubscribeAll.complete();
    }

}
