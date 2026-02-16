import { Routes } from "@angular/router";
import { Alert } from "lib-core";

import AlertService = Alert.AlertService;

import { QuestionRepoComponent } from "./features/question-repo/question-repo.component";
import { QuestionRepoService } from "./features/question-repo/question-repo.service";
import { QuestionBrowserComponent } from "./features/question-browser/question-browser.component";
import { SyllabusApiService } from "@jee-common/services/syllabus-api.service";
import { QuestionBrowserService } from "./features/question-browser/question-browser.service";

export const featureRoutes: Routes = [
    {
        path: '',
        redirectTo: 'question-repo',
        pathMatch: 'full'
    },
    {
        path: 'question-repo',
        title: 'Question Repository',
        component: QuestionRepoComponent,
        providers: [
            AlertService,
            QuestionRepoService
        ]
    },
    {
        path: 'question-browser',
        title: 'Question Browser',
        component: QuestionBrowserComponent,
        providers: [
            AlertService,
            QuestionRepoService,
            SyllabusApiService,
            QuestionBrowserService
        ]
    }
] ;