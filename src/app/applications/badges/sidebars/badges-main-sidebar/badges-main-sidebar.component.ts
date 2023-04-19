import { Component, OnInit } from '@angular/core';
import { fuseAnimations } from '@fuse/animations';
@Component({
  selector: 'badges-main-sidebar',
  templateUrl: './badges-main-sidebar.component.html',
  styleUrls: ['./badges-main-sidebar.component.scss'],
  animations   : fuseAnimations
})
export class BadgesMainSidebarComponent implements OnInit {

  constructor() { }

  ngOnInit(): void {
  }

}
