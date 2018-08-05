
//import { LoadModule } from './component/load/load.module';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpModule, Http } from '@angular/http';
import { RouterModule } from '@angular/router';
import { headerComponent } from "../components/header/header.component";
import { footerComponent } from "../components/footer/footer.component";
//import { LoadingModule, ANIMATION_TYPES } from 'ngx-loading';
import { AngularMultiSelectModule } from 'angular2-multiselect-dropdown/angular2-multiselect-dropdown';
import { SolutionSetupDetailComponent } from '../components/solutionSetupDetail/solutioSetupDetail.component';
import { OnlyNumericValidator } from '../components/_directives/onlyNumericValidator.directive';
import { TranslateModule, TranslateLoader } from '@ngx-translate/core';
import { TranslateHttpLoader } from '@ngx-translate/http-loader';
import { TranslateService } from '@ngx-translate/core'; 
import { Title } from '@angular/platform-browser';
import { LocalizedDatePipe } from '../components/Services/localizedate.service';
import { UtilityService } from '../components/Services/utility.service';
import { EqualValidator } from '../components/_directives/equal-validator.directive';
import { ModalComponent } from '../components/modal/modal.component';
import { NgxPaginationModule } from 'ngx-pagination';
import { MyDatePickerModule } from 'mydatepicker';
import { TooltipModule } from 'ngx-bootstrap';

export function HttpLoaderFactory(http: Http) {
    return new TranslateHttpLoader(http, './i18n/', '.json');
}

@NgModule({
    declarations: [
        headerComponent,
        footerComponent,
        SolutionSetupDetailComponent,
        OnlyNumericValidator,
        LocalizedDatePipe,
        EqualValidator,
        ModalComponent
    ],
    providers: [Title],
    imports: [
        CommonModule,
        FormsModule,
        HttpModule,
        RouterModule,
        AngularMultiSelectModule,
        NgxPaginationModule,
        MyDatePickerModule,
        TooltipModule.forRoot(),
        TranslateModule.forRoot({
            loader: {
                provide: TranslateLoader,
                useFactory: HttpLoaderFactory,
                deps: [Http]
            }
        }),
    ],
    exports: [
        headerComponent,
        footerComponent,
        SolutionSetupDetailComponent,
        OnlyNumericValidator,
        TranslateModule,
        LocalizedDatePipe,
        EqualValidator,
        ModalComponent
    ]
})
export class SharedModule {
    constructor() {
        
    }
}
