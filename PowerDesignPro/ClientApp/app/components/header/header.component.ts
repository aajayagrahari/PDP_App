import { Component, OnInit } from '@angular/core';
import { userService } from '../Services/user.service';
import { storeagesevice } from '../Services/storeage.service';
import { UtilityService } from '../Services/utility.service';
import { TranslateService } from '@ngx-translate/core';
import { Observable } from 'rxjs/Observable';
import { Subject } from 'rxjs'; 
import { Store } from '@ngrx/store';
import { Title } from '@angular/platform-browser';
@Component({
    selector: 'pdpheader',
    providers: [userService],
    templateUrl: './header.component.html',
    styleUrls: ['./header.component.css']
})
export class headerComponent implements OnInit {
    public UserName: string;   
    public CurrentLanguage: string;
    lang = new Subject<string>();
   public lang$: Observable<string>; 


   constructor(private _userService: userService, private _storeagesevice: storeagesevice, public translate: TranslateService, public _utility: UtilityService, private readonly store: Store<string>, private titleService: Title) {
        _storeagesevice.getLoggedIndetail.subscribe(() => {
            this.GetLoggedInUserDetail();
            this.lang$ = this.store.select(()=>_utility.userBrowserLocale);


                  });
    }
    onLogff(): void {
        this._userService.logout();
    }

    ngOnInit() {
        this.GetLoggedInUserDetail();
        

    }

    GetLoggedInUserDetail(): void {
        this.UserName = this._storeagesevice.get(this._userService.userName);          
        this._utility.setUserPreferredLanguage();
        this.CurrentLanguage = this._utility.PreferredLanguageDescription;      

    }

    changeLocale(language: string, description: string)
    { 
        this._storeagesevice.save("userPreferredLanguage", language);   
        this._utility.PreferredLanguageDescription = description;
        this.CurrentLanguage = this._utility.PreferredLanguageDescription;      
        this._utility.userBrowserLocale = language;
        this.translate.use(language);  
        //retrieving page title key
        var pageTitleKey=(this._storeagesevice.get("pageTitleKey"));
        this.translate.get(pageTitleKey).subscribe(name => {
            this.titleService.setTitle(name + ' - PowerDesignPro');
        });
        this.lang
            .startWith(this._utility.userBrowserLocale)
            .subscribe(lang => this.store.dispatch({ "type": this._utility.userBrowserLocale }));

    }
     
}
