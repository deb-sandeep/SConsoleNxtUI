import { Routes } from "@angular/router";
import { Alert } from "lib-core";

import AlertService = Alert.AlertService;

import { QuestionRepoComponent } from "./features/question-repo/question-repo.component";
import { QuestionRepoService } from "./features/question-repo/question-repo.service";

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
        providers: [AlertService, QuestionRepoService]
    }
] ;