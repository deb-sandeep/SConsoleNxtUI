import { Routes } from "@angular/router";
import { MainLoginComponent } from "./pages/01-main-login/main-login.component";
import { WelcomeScreenComponent } from "./pages/02-welcome-screen/welcome-screen.component";
import { InstructionScreenComponent } from "./pages/03-instruction-screen/instruction-screen.component";
import { ExamScreenComponent } from "./pages/04-exam-screen/exam-screen.component";
import { SubmitScreenComponent } from "./pages/05-submit-screen/submit-screen.component";
import { ResultScreenComponent } from "./pages/07-result-screen/result-screen.component";

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
    },
    {
        path: 'exam-screen',
        title: 'JEE Main',
        component: ExamScreenComponent,
    },
    {
        path: 'submit-screen',
        title: 'Submit Exam',
        component: SubmitScreenComponent,
    },
    {
        path: 'result-screen',
        title: 'Exam Results',
        component: ResultScreenComponent,
    }
] ;