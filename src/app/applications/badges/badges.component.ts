import { Component, ElementRef, OnInit, ViewChild, ViewEncapsulation } from '@angular/core';

import { fuseAnimations } from '@fuse/animations';

@Component({
    selector: 'badges',
    templateUrl: './badges.component.html',
    styleUrls: ['./badges.component.scss'],
    animations: fuseAnimations,
    encapsulation: ViewEncapsulation.None
})
export class BadgesComponent {

    
}
