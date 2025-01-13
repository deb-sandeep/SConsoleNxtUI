import { Routes } from "@angular/router";
import { ManageBooksComponent } from "./features/manage-books/manage-books.component";
import { BookListComponent } from "./features/manage-books/components/book-list/book-list.component";
import { BookUploadReviewComponent } from "./features/manage-books/components/book-upload-review/book-upload-review.component";
import { BookUploadResultComponent } from "./features/manage-books/components/book-upload-result/book-upload-result.component";

import { manageBooksRoutes } from "./features/manage-books/routes" ;

export const featureRoutes: Routes = [
    {
        path: '',
        redirectTo: 'manage-books',
        pathMatch: 'full'
    },
    {
        path: 'manage-books',
        title: 'Manage Books',
        component: ManageBooksComponent,
        children: manageBooksRoutes
    },
] ;