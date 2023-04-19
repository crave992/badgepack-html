import { Component, OnInit } from '@angular/core';
import { fuseAnimations } from '@fuse/animations';
@Component({
  selector: 'users-main-sidebar',
  templateUrl: './users-main-sidebar.component.html',
  styleUrls: ['./users-main-sidebar.component.scss'],
  animations   : fuseAnimations
})
export class UsersMainSidebarComponent implements OnInit {

  constructor() { }

  ngOnInit(): void {
  }

}
