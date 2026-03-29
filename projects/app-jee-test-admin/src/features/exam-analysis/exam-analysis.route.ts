import { Routes } from "@angular/router";
import { ExamAttemptListComponent } from "./pages/exam-list/exam-attempt-list.component";
import { AnalysisScreenComponent } from "./pages/analysis-screen/analysis-screen.component";

export const examAnalysisRoutes: Routes = [
    {
        path: '',
        redirectTo: 'attempt-listing',
        pathMatch: 'full'
    },
    {
        path: 'attempt-listing',
        title: 'Attempt List',
        component: ExamAttemptListComponent,
    },
    {
        path: 'analysis-screen/:examAttemptId',
        title: 'Attempt Analysis',
        component: AnalysisScreenComponent,
    }
] ;