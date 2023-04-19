import { ActivatedRoute, Router } from '@angular/router';
import { Component, ElementRef, OnInit, ViewChild, ViewEncapsulation, HostBinding, OnDestroy } from '@angular/core';

import { MatTableDataSource } from '@angular/material/table';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort, Sort } from '@angular/material/sort';

import { pluck, takeUntil } from 'rxjs/operators';
import { Subject, Observable } from 'rxjs';

import { fuseAnimations } from '@fuse/animations';

import { FuseSidebarService } from '@fuse/components/sidebar/sidebar.service';

import { Store, Select } from '@ngxs/store';
import { GetBadges } from 'app/shared/states/badge.actions';
import { BadgeState } from 'app/shared/states/badge.state';

import { environment } from 'environments/environment';
import { GlobalService } from 'app/shared/services/global.service';
import { ExportService } from 'app/shared/services/export.service';
import { BadgeUtil } from "./badgeUtil";
import { map, catchError } from 'rxjs/operators';

@Component({
    selector: 'badges-list',
    templateUrl: './badges-list.component.html',
    styleUrls: ['./badges-list.component.scss'],
    animations: fuseAnimations,
    encapsulation: ViewEncapsulation.None
})
export class BadgesListComponent implements OnInit, OnDestroy {
    @HostBinding('class') classes = 'center';

    badges = new MatTableDataSource([]);
    status: any;
    badgeList: any[];
    badgeTable: any[];

    @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;

    @ViewChild(MatSort, { static: true }) sort: MatSort;

    tableColumns = [
    'image',
    'badgeId', 
    'badge_name', 
    'recurrences', 
    'group', 
    'label', 
    'status', 
    'date_created', 
    'date_updated', 
    'creator', 
    'updator'
    ];

    @ViewChild('filter', { static: true })
    filter: ElementRef;

    @Select(BadgeState.badges) badges$: Observable<any>;
    @Select(state => state.badge.pagination) pagination$;

    appEndpoint: string;

    private _unsubscribeAll: Subject<any>;
    
    /**
     * Constructor
     *
     * @param {FuseSidebarService} _fuseSidebarService
    **/
     constructor(
        private _store: Store,
        private _fuseSidebarService: FuseSidebarService,
        private _globalService: GlobalService,
        private _router: Router,
        private _exportService: ExportService
    ) {
        this.appEndpoint = environment.appEndpoint;
        this.status = 'all';

        // Set the private defaults
        this._unsubscribeAll = new Subject();
    }
    ngOnInit(): void {
        if (this._router.url.indexOf('/badges/active') > -1) {
            this.status = 'active';
        } else if (this._router.url.indexOf('/badges/inactive') > -1) {
            this.status = 'inactive';
        }
    
        this._store.dispatch( new GetBadges({page: 1}, this.status));
        this._globalService.ngxUiLoader();

        this.badges$
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe((badges) => {
                if (badges) {
                    this.badgeList = badges;
                    this.badges = new MatTableDataSource(badges);
                    this.badges.paginator = this.paginator;
                    this.badges.sort = this.sort;

                    this._globalService.ngxUiLoader('stop');
                }
            });
    }

    searchFilter(event: Event): void {
        const filterValue = (event.target as HTMLInputElement).value;
        this.badges.filter = filterValue.trim().toLowerCase();
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

    sortData(sort: Sort) {
        const data = this.badgeList.slice();
        if (!sort.active || sort.direction === '') {
            this.badgeTable = data;
          return;
        }
    
        this.badgeTable = this.badgeList.slice().sort((a, b) => {
          const isAsc = sort.direction === 'asc';
          switch (sort.active) {
            case 'badgeId': return this.compare(a?.badge_id?.toUpperCase(), b?.badge_id?.toUpperCase(), isAsc);
            case 'badge_name': return this.compare(a?.name?.toUpperCase(), b?.name?.toUpperCase(), isAsc);
            case 'recurrences': return this.compare(a?.recurrence_type.toUpperCase(), b?.recurrence_type.toUpperCase(), isAsc);
            case 'group': return this.compare(a?.groups[0]?.code.toUpperCase(), b?.groups[0]?.code.toUpperCase(), isAsc);
            case 'label': return this.compare(a?.labels[0]?.name.toUpperCase(), b?.labels[0]?.name.toUpperCase(), isAsc);
            case 'date_created': return this.compare(a?.created_at, b?.created_at, isAsc); 
            case 'date_updated': return this.compare(a?.updated_at, b?.updated_at, isAsc); 
            case 'creator': return this.compare(a?.creator?.name.toUpperCase(), b?.creator?.name.toUpperCase(), isAsc); 
            case 'updator': return this.compare(a?.updator?.name.toUpperCase(), b?.updator?.name.toUpperCase(), isAsc); 
            default: return 0;
          }
        });
        this.badges = new MatTableDataSource(this.badgeTable);
        this.badges.paginator = this.paginator;
        this.badges.sort = this.sort;

      }

      compare(a: number | string, b: number | string, isAsc: boolean) {
        if (!a) {
            a = '';
        }
        return (a < b ? -1 : 1) * (isAsc ? 1 : -1);
      }

      exportToCsv(): void{
        this._exportService.exportBadges()
        .pipe(
          map(x => JSON.stringify(x)),
          map(x => JSON.parse(x)),
          pluck("data")
        )
        .subscribe((data) => {
          let newdata = data.map (
            (badgeData:any) => {
            let badgeslist:{
              Badge_ID?:any,
              Name?:any,
              Description?:any,
              Recurrence?:any,
              Groups?:any,
              Labels?:any,
              Status?:any ,
              Created_At?:any,
              Updated_At?:any,
              Created_by?:any,
              Last_Updated_by?:any
  
            }={};
            if (badgeData.badge_id !== null) {
                badgeslist.Badge_ID = badgeData.badge_id.toUpperCase() 
            }else{
                badgeslist.Badge_ID = '';
            }
            var nameformat = badgeData.name;
            badgeslist.Name = nameformat.charAt(0).toUpperCase() + nameformat.slice(1) || null;

            var descriptionformat = badgeData.description;
            badgeslist.Description = descriptionformat.charAt(0).toUpperCase() + descriptionformat.slice(1) || null;

            if(badgeData.recurrence_type === 'Expires-after'){
                var RecurrenceData  = badgeData.recurrence_type.replace('-', ' ') + ' ' + badgeData.recurrence_length + ' ' + badgeData.recurrence.replace('s', '(s)') || null;
            }
            else if(badgeData.recurrence_type === 'End-of'){
                var RecurrenceData  = badgeData.recurrence_type.replace('-', ' ') + ' ' + badgeData.recurrence_length + ' ' + badgeData.recurrence.replace('s', '') || null;
            }
            else if(badgeData.recurrence_type === 'None'){
                var RecurrenceData  = badgeData.recurrence_type + ' '  || null;
            }
            badgeslist.Recurrence = RecurrenceData;
  
            let groupdata = badgeData.groups.map (
              (badgeGroupList:any) => {
              let badgeGroup:{
                Group?:any
              }={};
              badgeGroup.Group = badgeGroupList.code;
              return badgeGroupList.code;
              }).join(', '); 
               
              if (groupdata !== null) {
                badgeslist.Groups = groupdata.toUpperCase() 
              }else{
                badgeslist.Groups = '';
              }

              let labeldata = badgeData.labels.map (
                (badgeLabelList:any) => {
                let badgeLabel:{
                  Label?:any
                }={};
                badgeLabel.Label = badgeLabelList.name.toUpperCase();
                return badgeLabel.Label;
                }).join(', '); 
                 
                if (labeldata !== null) {
                  badgeslist.Labels = labeldata  || null;
                }else{
                  badgeslist.Labels = '';
                }

            var statusformat = badgeData.status;
            badgeslist.Status = statusformat.charAt(0).toUpperCase() + statusformat.slice(1) || null;
  
            let  months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
            let created_month = new Date(badgeData.created_at || null);
            let created_monthName = months[created_month.getMonth()];
  
             var created_date = new Date(badgeData.created_at || null);
             badgeslist.Created_At = 
             ((created_date.getDate() > 9) ? created_date.getDate() : ('0' + created_date.getDate()))
             + '-' + created_monthName
             + '-' + created_date.getFullYear();
  
            let updated_month = new Date(badgeData.updated_at || null);
            let updated_monthName = months[updated_month.getMonth()];
            var updated_date = new Date(badgeData.updated_at || null);
            
            badgeslist.Updated_At = 
             ((updated_date.getDate() > 9) ? updated_date.getDate() : ('0' + updated_date.getDate()))
             + '-' + updated_monthName 
             + '-' + updated_date.getFullYear(); 
            
            if(badgeData.creator !== null){
              badgeslist.Created_by = badgeData.creator.name || null + "\r\n" +  badgeData.creator.username.toUpperCase() || null;
            }else{
              badgeslist.Created_by = '';
            }

            if(badgeData.updator !== null){
              badgeslist.Last_Updated_by = badgeData.updator.name || null + "\r\n" +  badgeData.updator.username.toUpperCase() || null;
            }else{
              badgeslist.Last_Updated_by = '';
            }
 
            return badgeslist;
            });

             BadgeUtil.exportArrayToExcel(newdata, "Badges List"); 
  
        });
      }

}
