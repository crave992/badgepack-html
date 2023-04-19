import { Component, OnInit } from '@angular/core';
import { fuseAnimations } from '@fuse/animations';
@Component({
  selector: 'groups-main-sidebar',
  templateUrl: './groups-main-sidebar.component.html',
  styleUrls: ['./groups-main-sidebar.component.scss'],
  animations   : fuseAnimations
})
export class GroupsMainSidebarComponent implements OnInit {

  constructor() { }

  ngOnInit(): void {
  }

}
