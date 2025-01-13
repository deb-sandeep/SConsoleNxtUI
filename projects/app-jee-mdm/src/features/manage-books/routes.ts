import { Routes } from "@angular/router";
import { BookListComponent } from "./components/book-list/book-list.component";
import { BookUploadReviewComponent } from "./components/book-upload-review/book-upload-review.component";
import { BookUploadResultComponent } from "./components/book-upload-result/book-upload-result.component";

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
        path: 'upload-result',
        title: 'Upload Results',
        component: BookUploadResultComponent
    },
    {
        path: 'book-list',
        title: 'Book List',
        component: BookListComponent
    }
] ;