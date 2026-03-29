import { Routes } from "@angular/router";
import { SelectExamTypeComponent } from "./1-select-exam-type/select-exam-type.component";
import { SelectExamSectionsComponent } from "./3-select-exam-sections/select-exam-sections.component";
import { ConfigureExamSectionsComponent } from "./4-configure-exam-sections/configure-exam-sections.component";
import { SelectExamSubjectsComponent } from "./2-select-exam-subjects/select-exam-subjects.component";
import { SelectTopicsComponent } from "./5-select-topics/select-topics.component";
import { ConfigureDurationComponent } from "./6-configure-duration/configure-duration.component";

export const examSetupRoutes: Routes = [
    {
        path: '',
        redirectTo: 'sel-exam-type',
        pathMatch: 'full'
    },
    {
        path: 'sel-exam-type',
        title: 'Select Exam Type',
        component: SelectExamTypeComponent,
    },
    {
        path: 'sel-exam-subjects',
        title: 'Select Exam Subjects',
        component: SelectExamSubjectsComponent,
    },
    {
        path: 'sel-exam-sections',
        title: 'Select Exam Sections',
        component: SelectExamSectionsComponent,
    },
    {
        path: 'conf-exam-sections',
        title: 'Configure Exam Sections',
        component: ConfigureExamSectionsComponent,
    },
    {
        path: 'select-topics/:subjectIndex',
        title: 'Select Subject Topics',
        component: SelectTopicsComponent,
    },
    {
        path: 'configure-duration',
        title: 'Configure duration and notes',
        component: ConfigureDurationComponent,
    }
] ;