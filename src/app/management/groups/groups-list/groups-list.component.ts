import { Component, ElementRef, OnInit, ViewChild, ViewEncapsulation, HostBinding, OnDestroy } from '@angular/core';

import { MatTableDataSource } from '@angular/material/table';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';

import { pluck, takeUntil } from 'rxjs/operators';
import { Subject, Observable } from 'rxjs';

import { fuseAnimations } from '@fuse/animations';

import { FuseSidebarService } from '@fuse/components/sidebar/sidebar.service';

import { Store, Select } from '@ngxs/store';
import { GetGroups } from 'app/shared/states/group.actions';
import { GroupState } from 'app/shared/states/group.state';
import { GlobalService } from 'app/shared/services/global.service';
import { ExportService } from 'app/shared/services/export.service';
import { GroupUtil } from "./groupUtil";
import { map, catchError } from 'rxjs/operators';
import { Router } from '@angular/router';

interface String {
    replaceArray: (find: any, replace: any) => any;
}

@Component({
    selector: 'groups-list',
    templateUrl: './groups-list.component.html',
    styleUrls: ['./groups-list.component.scss'],
    animations: fuseAnimations,
    encapsulation: ViewEncapsulation.None
})
export class GroupsListComponent implements OnInit, OnDestroy {
    @HostBinding('class') classes = 'center';

    groups = new MatTableDataSource([]);

    status: any;

    @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;

    @ViewChild(MatSort, { static: true }) sort: MatSort;

    tableColumns = ['image', 'code', 'name', 'status', 'created_at', 'updated_at'];

    @ViewChild('filter', { static: true }) filter: ElementRef;

    @Select(GroupState.groups) groups$: Observable<any>;
    @Select(state => state.group.pagination) pagination$;

    private _unsubscribeAll: Subject<any>;
    
    /**
     * Constructor
     *
     * @param {FuseSidebarService} _fuseSidebarService
     */
    constructor(
        private _store: Store,
        private _fuseSidebarService: FuseSidebarService,
        private _globalService: GlobalService,
        private _exportService: ExportService,
        private _router: Router
    ) {
        // Set the private defaults
        this._unsubscribeAll = new Subject();
    }
    ngOnInit(): void {
        if (this._router.url.indexOf('/groups/active') > -1) {
            this.status = 'active';
        } else if (this._router.url.indexOf('/groups/inactive') > -1) {
            this.status = 'inactive';
        }

        this._store.dispatch( new GetGroups({page: 1}, this.status) );
        this._globalService.ngxUiLoader();

        this.groups$
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe((groups) => {
                if (groups) {
                    this.groups = new MatTableDataSource(groups);
    
                    this.groups.paginator = this.paginator;
                    this.groups.sort = this.sort;

                    this._globalService.ngxUiLoader('stop');
                }
            });
    }

    searchFilter(event: Event): void {
        const filterValue = (event.target as HTMLInputElement).value;
        this.groups.filter = filterValue.trim().toLowerCase();
    }

    ngOnDestroy(): void {
        // Unsubscribe from all subscriptions
        this._unsubscribeAll.next();
        this._unsubscribeAll.complete();
    }

    /**
     * Toggle sidebar
     *
     * @param name
     */
    toggleSidebar(name): void {
        this._fuseSidebarService.getSidebar(name).toggleOpen();
    }

    exportToCsv(): void{
        this._exportService.exportGroups()
        .pipe(
          map(x => JSON.stringify(x)),
          map(x => JSON.parse(x)),
          pluck("data")
        )
        .subscribe((data) => {
          let newdata = data.map (
            (groupData:any) => {
            let grouplist:{
              Reference_Code?:any,
              Name?:any,
              Status?:any,
              Created_At?:any,
              Updated_At?:any
  
            }={};
            if (groupData.code !== null) {
                grouplist.Reference_Code = groupData.code.toUpperCase() 
            }else{
                grouplist.Reference_Code = '';
            }

            var str = groupData.name;
            var replaced = str.replace(/&quot;/gi, '"').replace(/&amp;/gi, '&');

             grouplist.Name = replaced || null;
  
            var statusformat = groupData.status;
            grouplist.Status = statusformat.charAt(0).toUpperCase() + statusformat.slice(1) || null;
  
            let  months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
            let created_month = new Date(groupData.created_at || null);
            let created_monthName = months[created_month.getMonth()];
  
             var created_date = new Date(groupData.created_at || null);
             grouplist.Created_At = 
             ((created_date.getDate() > 9) ? created_date.getDate() : ('0' + created_date.getDate()))
             + '-' + created_monthName
             + '-' + created_date.getFullYear();
  
            let updated_month = new Date(groupData.updated_at || null);
            let updated_monthName = months[updated_month.getMonth()];
             var updated_date = new Date(groupData.updated_at || null);
             grouplist.Updated_At = 
             ((updated_date.getDate() > 9) ? updated_date.getDate() : ('0' + updated_date.getDate()))
             + '-' + updated_monthName 
             + '-' + updated_date.getFullYear(); 
  
            return grouplist;
            });

            GroupUtil.exportArrayToExcel(newdata, "Groups List"); 
  
        });
      }

}
