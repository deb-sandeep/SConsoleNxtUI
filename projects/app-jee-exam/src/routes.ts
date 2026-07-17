import { Routes } from "@angular/router";

import { ExamListingComponent } from "./features/exam-listing/exam-listing.component";
import { JeeMainComponent } from "./features/jee-main/jee-main.component";
import { jeeMainRoutes } from "./features/jee-main/jee-main.route";
import { JeeMainService } from "./features/jee-main/jee-main.service";
import { JeeAdvancedComponent } from "./features/jee-advanced/jee-advanced.component";
import { jeeAdvancedRoutes } from "./features/jee-advanced/jee-advanced.route";
import { JeeAdvancedService } from "./features/jee-advanced/jee-advanced.service";
import { EventLogService } from "@jee-common/services/event-log.service";
import { ExamApiService } from "@jee-common/services/exam-api.service";
import { JeeBaseService } from "@jee-common/services/jee-base.service";

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
        providers: [ExamApiService]
    },
    {
        path: 'jee-main/:examId',
        title: 'JEE Main',
        component: JeeMainComponent,
        children: jeeMainRoutes,
        providers: [ExamApiService, JeeBaseService, JeeMainService, EventLogService ]
    },
    {
        path: 'jee-advanced/:examId',
        title: 'JEE Advanced',
        component: JeeAdvancedComponent,
        children: jeeAdvancedRoutes,
        providers: [ExamApiService, JeeBaseService, JeeAdvancedService, EventLogService ]
    },
] ;