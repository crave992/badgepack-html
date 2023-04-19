import { Component } from '@angular/core';
import { environment } from 'environments/environment';

@Component({
    selector   : 'footer',
    templateUrl: './footer.component.html',
    styleUrls  : ['./footer.component.scss']
})
export class FooterComponent
{
    appVersion = '1.0.0';
    /**
     * Constructor
     */
    constructor()
    {
        this.appVersion = environment.appVersion || '1.0.0';
    }
}
