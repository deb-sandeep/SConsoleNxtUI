import { Routes } from "@angular/router";
import { ExamAttemptListComponent } from "./pages/exam-list/exam-attempt-list.component";

export const examAnalysisRoutes: Routes = [
    {
        path: '',
        redirectTo: 'exam-list',
        pathMatch: 'full'
    },
    {
        path: 'exam-list',
        title: 'Exam List',
        component: ExamAttemptListComponent,
    }
] ;