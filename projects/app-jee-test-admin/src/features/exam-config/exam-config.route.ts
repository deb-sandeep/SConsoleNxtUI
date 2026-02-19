import { Routes } from "@angular/router";
import { ExamListComponent } from "./pages/exam-list/exam-list.component";
import { ExamSetupComponent } from "./pages/exam-setup/exam-setup.component";
import { examSetupRoutes } from "./pages/exam-setup/exam-setup.route";
import { ExamSetupService } from "./pages/exam-setup/exam-setup.service";

export const examConfigRoutes: Routes = [
    {
        path: '',
        redirectTo: 'exam-setup',
        pathMatch: 'full'
    },
    {
        path: 'exam-list',
        title: 'Exam List',
        component: ExamListComponent,
    },
    {
        path: 'exam-setup',
        title: 'New Exam Setup',
        children: examSetupRoutes,
        component: ExamSetupComponent,
        providers: [ExamSetupService],
    }
] ;