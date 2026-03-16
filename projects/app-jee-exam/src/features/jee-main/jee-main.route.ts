import { Routes } from "@angular/router";
import { MainLoginComponent } from "./pages/main-login/main-login.component";
import { WelcomeScreenComponent } from "./pages/welcome-screen/welcome-screen.component";
import { InstructionScreenComponent } from "./pages/instruction-screen/instruction-screen.component";

export const jeeMainRoutes: Routes = [
    {
        path: '',
        redirectTo: 'login-dialog',
        pathMatch: 'full'
    },
    {
        path: 'login-dialog',
        title: 'Login',
        component: MainLoginComponent,
    },
    {
        path: 'welcome-screen',
        title: 'Welcome',
        component: WelcomeScreenComponent,
    },
    {
        path: 'instruction-screen',
        title: 'Instructions',
        component: InstructionScreenComponent,
    }
] ;