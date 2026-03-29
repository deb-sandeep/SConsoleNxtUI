import { Routes } from "@angular/router";
import { Alert } from "lib-core";

import AlertService = Alert.AlertService;

import { QuestionRepoComponent } from "./features/question-repo/question-repo.component";
import { QuestionRepoService } from "./features/question-repo/question-repo.service";
import { QuestionBrowserComponent } from "./features/question-browser/question-browser.component";
import { SyllabusApiService } from "@jee-common/services/syllabus-api.service";
import { QuestionBrowserService } from "./features/question-browser/question-browser.service";
import { ExamConfigComponent } from "./features/exam-config/exam-config.component";
import { examConfigRoutes } from "./features/exam-config/exam-config.route";
import { ExamEditComponent } from "./features/exam-edit/exam-edit.component";
import { ExamEditService } from "./features/exam-edit/exam-edit.service";
import { ExamAnalysisComponent } from "./features/exam-analysis/exam-analysis.component";
import { examAnalysisRoutes } from "./features/exam-analysis/exam-analysis.route";
import { ExamApiService } from "@jee-common/services/exam-api.service";
import { JeeBaseService } from "@jee-common/services/jee-base.service";
import { EventLogService } from "@jee-common/services/event-log.service";

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
    },
    {
        path: 'exam-config',
        title: 'Exam Configuration',
        component: ExamConfigComponent,
        children: examConfigRoutes,
        providers: [
            AlertService,
            QuestionRepoService,
            SyllabusApiService
        ]
    },
    {
        path: 'exam-edit/:examId',
        title: 'Exam Edit',
        component: ExamEditComponent,
        providers: [
            ExamEditService,
            SyllabusApiService
        ]
    },
    {
        path: 'exam-analysis',
        title: 'Exam Analysis',
        component: ExamAnalysisComponent,
        children: examAnalysisRoutes,
        providers: [
          ExamApiService,
          EventLogService,
          JeeBaseService,
        ]
    }
] ;