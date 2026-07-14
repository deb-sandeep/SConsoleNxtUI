import { Routes } from "@angular/router";
import { MainLoginComponent } from "../jee-main/pages/01-main-login/main-login.component";
import { InstructionScreenComponent } from "./pages/03-instruction-screen/instruction-screen.component";
import { ExamScreenComponent } from "./pages/04-exam-screen/exam-screen.component";

export const jeeAdvancedRoutes: Routes = [
    {
        path: '',
        redirectTo: 'login-dialog',
        pathMatch: 'full'
    },
    {
        path: 'login-dialog',
        title: 'Login',
        component: MainLoginComponent,
        data: { nextRouteAfterLogin: 'instruction-screen' },
    },
    {
        path: 'instruction-screen',
        title: 'Instructions',
        component: InstructionScreenComponent,
    },
    {
        path: 'exam-screen',
        title: 'JEE Advanced',
        component: ExamScreenComponent,
    },
] ;
