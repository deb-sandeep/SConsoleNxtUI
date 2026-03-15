import { Routes } from "@angular/router";
import { MainLoginComponent } from "./pages/main-login/main-login.component";

export const jeeMainRoutes: Routes = [
    {
        path: '',
        redirectTo: '../login-dialog',
        pathMatch: 'full'
    },
    {
        path: '../login-dialog',
        title: 'Login',
        component: MainLoginComponent,
    }
] ;