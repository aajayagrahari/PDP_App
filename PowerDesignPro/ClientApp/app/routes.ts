import { Routes } from '@angular/router';
import { loginComponent } from "./components/login/login.component";
import { registerComponent } from "./components/register/register.component";
import { HomeComponent } from "./components/home/home.component";
import { authenticate } from "./components/_authenticate/authenticate";
import { UserDefaultSolutionSetupComponent } from "./components/userDefaultSolutionSetup/userDefaultSolutionSetup.component";
import { AccountSettingsComponent } from "./components/accountSettings/accountSettings.component";
import { ConfirmEmailComponent } from './components/confirmEmail/confirmEmail.component';
import { ForgotPasswordComponent } from './components/forgotPassword/forgotPassword.component';
import { ResetPasswordComponent } from './components/resetPassword/resetPassword.component';

export const appRoutes: Routes = [
    { path: '', redirectTo: 'home', pathMatch: 'full', data: { title: 'pageTitle.Dashboard' } },
    { path: 'login', component: loginComponent, data: { title: 'pageTitle.Login' } },
    { path: 'register', component: registerComponent, data: { title: 'pageTitle.Register' } },
    { path: 'confirmEmail', component: ConfirmEmailComponent, data: { title: 'pageTitle.ConfirmEmail' } },
    { path: 'forgotPassword', component: ForgotPasswordComponent, data: { title: 'pageTitle.ForgotPassword' } },
    { path: 'resetPassword', component: ResetPasswordComponent, data: { title: 'pageTitle.ResetPassword' } },
    { path: 'home', component: HomeComponent, canActivate: [authenticate], data: { title: 'pageTitle.Dashboard' } },
    { path: 'userdefaults', component: UserDefaultSolutionSetupComponent, canActivate: [authenticate], data: { title: 'pageTitle.UserDefaults' } },
    { path: 'accountsettings', component: AccountSettingsComponent, canActivate: [authenticate], data: { title: 'pageTitle.AccountSettings' } },
    { path: 'project', loadChildren: './modules/project.module#ProjectModule', canActivate: [authenticate] },
    { path: '**', redirectTo: 'login', data: { title: 'pageTitle.Dashboard' } }
]