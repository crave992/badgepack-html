import { Component, ElementRef, OnInit, ViewChild, ViewEncapsulation, HostBinding, OnDestroy } from '@angular/core';

import { MatTableDataSource } from '@angular/material/table';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';

import { pluck, takeUntil } from 'rxjs/operators';
import { Subject, Observable } from 'rxjs';

import { fuseAnimations } from '@fuse/animations';

import { FuseSidebarService } from '@fuse/components/sidebar/sidebar.service';

import { Store, Select } from '@ngxs/store';
import { GetUsers } from 'app/shared/states/user.actions';
import { UserState } from 'app/shared/states/user.state';
import { GlobalService } from 'app/shared/services/global.service';
import { ExportService } from 'app/shared/services/export.service';
import { UserUtil } from "./userUtil";
import { map, catchError } from 'rxjs/operators';
import { Router } from '@angular/router';


@Component({
    selector: 'users-list',
    templateUrl: './users-list.component.html',
    styleUrls: ['./users-list.component.scss'],
    animations: fuseAnimations,
    encapsulation: ViewEncapsulation.None
})



export class UsersListComponent implements OnInit, OnDestroy {
    @HostBinding('class') classes = 'center';

    users = new MatTableDataSource([]);
    status: any;

    @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;

    @ViewChild(MatSort, { static: true }) sort: MatSort;

    tableColumns = ['image', 'name', 'email', 'role', 'group', 'timezone', 'status', 'created_at', 'updated_at'];

    @ViewChild('filter', { static: true })
    filter: ElementRef;

    @Select(UserState.users) users$: Observable<any>;
    @Select(state => state.user.pagination) pagination$;

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
        this.status = 'all';
        // Set the private defaults
        this._unsubscribeAll = new Subject();
    }
    ngOnInit(): void {
        if (this._router.url.indexOf('/users/active') > -1) {
            this.status = 'active';
        } else if (this._router.url.indexOf('/users/inactive') > -1) {
            this.status = 'inactive';
        }

        this._store.dispatch( new GetUsers({page: 1}, this.status) );
        this._globalService.ngxUiLoader();

        this.users$
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe((users) => {

                this.users = new MatTableDataSource(users);

                this.users.paginator = this.paginator;
                this.users.sort = this.sort;

                this._globalService.ngxUiLoader('stop');

            });

    }

    searchFilter(event: Event): void {
        const filterValue = (event.target as HTMLInputElement).value;
        this.users.filter = filterValue.trim().toLowerCase();
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
      this._exportService.exportUsers()
      .pipe(
        map(x => JSON.stringify(x)),
        map(x => JSON.parse(x)),
        pluck("data")
      )
      .subscribe((data) => {
        let newdata = data.map (
          (userData:any) => {
          let userlist:{
            CSID?:any,
            Email?:any,
            Role?:any,
            Groups?:any,
            Timezone?:any,
            Status?:any ,
            Created_At?:any,
            Updated_At?:any

          }={};
          if (userData.code !== null) {
            userlist.CSID = userData.code.toUpperCase()
          }else{
            userlist.CSID = '';
          }
          userlist.Email = userData.email || null;

          var roleformat = userData.role;
          userlist.Role = roleformat.charAt(0).toUpperCase() + roleformat.slice(1) || null;

          let groupdata = userData.groups.map (
            (userGroupList:any) => {
            let userGroup:{
              Group?:any
            }={};
            userGroup.Group = userGroupList.code;
            return userGroupList.code;
            }).join(', ');

            if (groupdata !== null) {
              userlist.Groups = groupdata.toUpperCase()
            }else{
              userlist.Groups = '';
            }

          userlist.Timezone = userData.meta.timezone || null;
          var statusformat = userData.status;
          userlist.Status = statusformat.charAt(0).toUpperCase() + statusformat.slice(1) || null;

          let  months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
          let created_month = new Date(userData.created_at || null);
          let created_monthName = months[created_month.getMonth()];

           var created_date = new Date(userData.created_at || null);
           userlist.Created_At =
           ((created_date.getDate() > 9) ? created_date.getDate() : ('0' + created_date.getDate()))
           + '-' + created_monthName
           + '-' + created_date.getFullYear();

          let updated_month = new Date(userData.updated_at || null);
          let updated_monthName = months[updated_month.getMonth()];
           var updated_date = new Date(userData.updated_at || null);
           userlist.Updated_At =
           ((updated_date.getDate() > 9) ? updated_date.getDate() : ('0' + updated_date.getDate()))
           + '-' + updated_monthName
           + '-' + updated_date.getFullYear();

          return userlist;
          });
           UserUtil.exportArrayToExcel(newdata, "Users List");

      });
    }
}
