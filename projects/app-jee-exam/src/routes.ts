import { Routes } from "@angular/router";

import { ExamListingComponent } from "./features/exam-listing/exam-listing.component";
import { ExamApiService } from "./exam-api.service";
import { JeeMainComponent } from "./features/jee-main/jee-main.component";
import { jeeMainRoutes } from "./features/jee-main/jee-main.route";
import { ExamService } from "./exam.service";

export const featureRoutes: Routes = [
    {
        path: '',
        redirectTo: 'exam-listing',
        pathMatch: 'full'
    },
    {
        path: 'exam-listing',
        title: 'Available Exams',
        component: ExamListingComponent,
        providers: [ExamService, ExamApiService]
    },
    {
        path: 'jee-main/:examId',
        title: 'JEE Main',
        component: JeeMainComponent,
        children: jeeMainRoutes,
        providers: [ExamService, ExamApiService]
    },
] ;