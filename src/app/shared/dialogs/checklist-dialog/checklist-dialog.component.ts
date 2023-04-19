import { Component, OnInit, ViewChild } from '@angular/core';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';

@Component({
  selector: 'app-checklist-dialog',
  templateUrl: './checklist-dialog.component.html',
  styleUrls: ['./checklist-dialog.component.scss']
})
export class ChecklistDialogComponent implements OnInit {

  checkListSource = new MatTableDataSource([]);

  isChecked = false;

  checkListId?: string;

  tableColumns = [
    'title',
    'issued_from',
    'issued_date',
    'issued_by'
  ];

  partialData = [
    {
      "id": 1,
      "type": 'manual',
      "title": 'this is manual',
      "issued_from": 'badgepack',
      "issued_date": '2 days ago',
      "issued_by": {
        "name": 'Christine Meniano',
        "username": "christineme"
      },
      "is_issued": false
    },
    {
      "id": 2,
      "type": 'ubertickets',
      "title": 'WFH Internet Setup',
      "issued_from": 'ubertickets',
      "issued_date": '2 days ago',
      "issued_by": {
        "name": 'Christine Meniano',
        "username": "christineme"
      },
      "is_issued": true
    }
  ];

  @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;
  @ViewChild(MatSort, { static: true }) sort: MatSort;

  constructor() { }

  ngOnInit(): void {
    this.checkListSource = new MatTableDataSource(this.partialData);

    this.checkListSource.paginator = this.paginator;
    this.checkListSource.sort = this.sort;
  }

  checkboxIsChecked(event, id): void {
    this.checkListId = id;

    if (event.target.checked) {
      this.partialData.find(x => x.id === id).is_issued = true;
    } else {
      this.partialData.find(x => x.id === id).is_issued = false;
    }
  }
}