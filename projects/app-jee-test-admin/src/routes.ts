import { Routes } from "@angular/router";
import { Alert } from "lib-core";

import AlertService = Alert.AlertService;

import { QuestionRepoComponent } from "./features/question-repo/question-repo.component";
import { SyllabusApiService } from "@jee-common/services/syllabus-api.service";
import { ProblemApiService } from "@jee-common/services/problem-api.service";

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
        providers: [AlertService, ProblemApiService, SyllabusApiService]
    }
] ;