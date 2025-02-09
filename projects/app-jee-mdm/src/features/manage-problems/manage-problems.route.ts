import { Routes } from "@angular/router";
import { TopicChapterListComponent } from "./pages/topic-chapter-list/topic-chapter-list.component";
import {
    TopicChapterProblemListComponent
} from "./pages/topic-chapter-problem-list/topic-chapter-problem-list.component";

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
    {
        path: 'topic-chapter-problem-list/:topicChapterMappingId/:topicId/:bookId/:chapterNum',
        title: 'Problem Topic Mapping',
        component: TopicChapterProblemListComponent
    }
] ;