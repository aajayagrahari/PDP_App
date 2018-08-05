import { Component, Injectable, Inject } from '@angular/core';
import { storeagesevice } from '../Services/storeage.service';
import { TranslateService } from '@ngx-translate/core';


@Injectable()
export class UtilityService {

    public PreferredLanguageDescription: string;
    public supportedLocale: string[] = ['en', 'es'];
    public userBrowserLocale: string;
    public userBrowserLocaleRegion: string;

    constructor(private _storeagesevice: storeagesevice, private translate: TranslateService) {
        this.getUserPreferredLocaleSettings();
    }

    private getUserPreferredLocaleSettings() {
        var userLocale = new Object();
        var locale = this._storeagesevice.get("userPreferredLanguage");
        var browserSetting = (window.navigator.language || 'en-US').split('-');
        this.userBrowserLocale = locale == undefined ? browserSetting[0] : locale;
        if (this.supportedLocale.join(',').indexOf(this.userBrowserLocale) === -1) {
            this.userBrowserLocale = 'en';
            this.userBrowserLocaleRegion = '-US';
        } else {
            this.userBrowserLocaleRegion = browserSetting.length > 1 && locale == undefined ? "-" + browserSetting[1] : "";
        }
    }

    public setUserPreferredLanguage() {
        this.PreferredLanguageDescription = (this.userBrowserLocale.toLowerCase() == "en" ? "English " : "Espanol ");
        this.translate.use(this.userBrowserLocale);

    }


}