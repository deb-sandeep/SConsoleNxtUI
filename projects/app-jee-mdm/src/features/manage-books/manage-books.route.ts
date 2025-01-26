import { Routes } from "@angular/router";
import { BookListComponent } from "./pages/book-list/book-list.component";
import { BookUploadReviewComponent } from "./pages/book-upload-review/book-upload-review.component";
import { BookDetailComponent } from "./pages/book-detail/book-detail.component";
import {TopicMappingComponent} from "./pages/topic-mapping/topic-mapping.component";

export const manageBooksRoutes: Routes = [
    {
        path: '',
        redirectTo: 'book-list',
        pathMatch: 'full'
    },
    {
        path: 'upload-review',
        title: 'Upload Review',
        component: BookUploadReviewComponent
    },
    {
        path: 'book-list',
        title: 'Book List',
        component: BookListComponent
    },
    {
        path: 'book-detail/:bookId',
        title: 'Book Detail',
        component: BookDetailComponent
    },
    {
        path: 'topic-mapping',
        title: 'Topic Mapping',
        component: TopicMappingComponent
    },
] ;