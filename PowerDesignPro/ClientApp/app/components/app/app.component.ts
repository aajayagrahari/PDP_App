import 'rxjs/add/operator/filter';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/mergeMap';

import { Component, OnInit, ViewChild} from '@angular/core';
import { Router, NavigationEnd, ActivatedRoute } from '@angular/router';
import { Title } from '@angular/platform-browser';
import { UtilityService } from '../Services/utility.service';
import { Observable } from 'rxjs/Observable';
import { Subject } from 'rxjs';
import { TranslateService } from '@ngx-translate/core'; 
import { storeagesevice } from '../Services/storeage.service';
//import * as $ from 'jquery';

@Component({
    selector: 'app',
    templateUrl: './app.component.html',
    styleUrls: ['./app.component.css']
})

export class AppComponent implements OnInit { 
     

    constructor(
        private _utility: UtilityService,
        private router: Router,
        private activatedRoute: ActivatedRoute,
        private titleService: Title, public translate: TranslateService, private _storeagesevice: storeagesevice
    ) {
        this._utility.setUserPreferredLanguage(); 
    }

    ngOnInit() {
      
        this.router.events
            .filter((event) => event instanceof NavigationEnd)
            .map(() => this.activatedRoute)
            .map((route) => {
                while (route.firstChild) route = route.firstChild;
                return route;
            })
            .filter((route) => route.outlet === 'primary')
            .mergeMap((route) => route.data)
            .subscribe((event) => this.translate.get(event['title']).subscribe(name => {
                this.titleService.setTitle(name + ' - PowerDesignPro'); 
                this._storeagesevice.save("pageTitleKey", event['title']);               
            }));

    }
     
}
