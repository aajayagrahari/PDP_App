import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { AppModuleShared } from './app.module.shared';
import { AppComponent } from './components/app/app.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations'
import { Store, StoreModule } from '@ngrx/store'; 
import { CookieLawModule } from 'angular2-cookie-law';
//import { InternationalPhoneModule } from 'ng4-intl-phone';
import { NgxPaginationModule } from 'ngx-pagination';
import { MyDatePickerModule } from 'mydatepicker';


@NgModule({
    bootstrap: [AppComponent],
    imports: [
        BrowserModule,
        BrowserAnimationsModule,
        AppModuleShared,
        CookieLawModule,
        NgxPaginationModule,
        MyDatePickerModule,
        //InternationalPhoneModule,
        StoreModule.forRoot(AppModuleShared),

    ],
    providers: [
        { provide: 'BASE_URL', useFactory: getBaseUrl },
        { provide: 'ORIGIN_URL', useValue: location.origin }
    ]
})
export class AppModule {
}

export function getBaseUrl() {
    return document.getElementsByTagName('base')[0].href;
}