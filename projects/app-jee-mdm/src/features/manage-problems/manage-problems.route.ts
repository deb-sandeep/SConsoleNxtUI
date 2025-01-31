import { Routes } from "@angular/router";
import { TopicChapterListComponent } from "./pages/topic-chapter-list/topic-chapter-list.component";

export const manageProblemsRoutes: Routes = [
    {
        path: '',
        redirectTo: 'topic-chapter-list',
        pathMatch: 'full'
    },
    {
        path: 'topic-chapter-list',
        title: 'Topic > Chapters',
        component: TopicChapterListComponent
    },
] ;