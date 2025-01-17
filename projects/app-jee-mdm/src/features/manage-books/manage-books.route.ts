import { Routes } from "@angular/router";
import { BookListComponent } from "./components/book-list/book-list.component";
import { BookUploadReviewComponent } from "./components/book-upload-review/book-upload-review.component";

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
    }
] ;