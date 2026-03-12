import { Routes } from "@angular/router";

import { ExamListingComponent } from "./features/exam-listing/exam-listing.component";

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
        providers: []
    },
] ;