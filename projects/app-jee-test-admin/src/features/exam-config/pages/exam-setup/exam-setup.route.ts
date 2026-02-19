import { Routes } from "@angular/router";
import { SelectExamTypeComponent } from "./select-exam-type/select-exam-type.component";
import { SelectExamSectionsComponent } from "./select-exam-sections/select-exam-sections.component";
import { ConfigureExamSectionsComponent } from "./configure-exam-sections/configure-exam-sections.component";

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
        path: 'sel-exam-sections',
        title: 'Select Exam Sections',
        component: SelectExamSectionsComponent,
    },
    {
        path: 'conf-exam-sections',
        title: 'Configure Exam Sections',
        component: ConfigureExamSectionsComponent,
    }
] ;