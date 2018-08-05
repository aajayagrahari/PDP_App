import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpModule, Http } from '@angular/http';
import { RouterModule, PreloadAllModules } from '@angular/router';

import { LoadingModule, ANIMATION_TYPES } from 'ngx-loading';
//import { Ng4LoadingSpinnerModule } from 'ng4-loading-spinner';
import { BootstrapModalModule } from 'ng2-bootstrap-modal';
//import { AngularMultiSelectModule } from 'angular2-multiselect-dropdown/angular2-multiselect-dropdown'; 
import { CookieLawModule } from 'angular2-cookie-law';
import { UtilityService } from './components/Services/utility.service';
import { AppComponent } from './components/app/app.component';
import { HomeComponent } from './components/home/home.component';
import { loginComponent } from './components/login/login.component';
import { registerComponent } from './components/register/register.component';
import { httpclient } from './components/Services/httpclient.component';
import { storeagesevice } from './components/Services/storeage.service';
import { userService } from './components/Services/user.service';
import { projectService } from './components/Services/project.services';
import { solutionService } from './components/Services/solution.services';
import { authenticate } from './components/_authenticate/authenticate'
//import { headerComponent } from './components/header/header.component';
//import { footerComponent } from './components/footer/footer.component';
import { SolutionSetupDetailComponent } from './components/solutionSetupDetail/solutioSetupDetail.component';
import { ConfirmComponent } from './components/confirm/confirm.component';
import { UserDefaultSolutionSetupComponent } from './components/userDefaultSolutionSetup/userDefaultSolutionSetup.component';
import { AccountSettingsComponent } from "./components/accountSettings/accountSettings.component";
import { appRoutes } from "./routes";
import { SharedModule } from "./modules/shared.module";
import { ConfirmEmailComponent } from './components/confirmEmail/confirmEmail.component';
import { ForgotPasswordComponent } from './components/forgotPassword/forgotPassword.component';
import { ResetPasswordComponent } from './components/resetPassword/resetPassword.component';
import { AddressValidationComponent } from './components/AddressValidation/AddressValidation.component';
import { NgxPaginationModule } from 'ngx-pagination';
import { MyDatePickerModule } from 'mydatepicker';
import { TooltipModule } from 'ngx-bootstrap';


@NgModule({
    declarations: [
        AppComponent,
        HomeComponent,
        registerComponent,
        loginComponent,
        ConfirmComponent,
        UserDefaultSolutionSetupComponent,
        AccountSettingsComponent,
        ConfirmEmailComponent,
        ForgotPasswordComponent,
        ResetPasswordComponent,
        AddressValidationComponent 
    ],
    providers: [authenticate, httpclient, storeagesevice, userService, projectService, solutionService, UtilityService],
    imports: [
        CommonModule,
        HttpModule,
        FormsModule,
        SharedModule,
        CookieLawModule,
        NgxPaginationModule,
        MyDatePickerModule,
        //InternationalPhoneModule,
        RouterModule.forRoot(appRoutes, { preloadingStrategy: PreloadAllModules }),
        LoadingModule.forRoot({
            animationType: ANIMATION_TYPES.threeBounce,
            backdropBackgroundColour: 'rgba(0,0,0,0.1)',
            backdropBorderRadius: '10px',
            fullScreenBackdrop: true,
            primaryColour: '#f0ad4e',
            secondaryColour: '#f0ad4e',
            tertiaryColour: '#f0ad4e'
        }),
        BootstrapModalModule,
        TooltipModule.forRoot()

        //InternationalPhoneModule
    ],
    exports: [
    ],
    entryComponents: [
        ConfirmComponent
    ]
})
export class AppModuleShared {
}
