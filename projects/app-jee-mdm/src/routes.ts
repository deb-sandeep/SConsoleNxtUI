import { Routes } from "@angular/router";
import { ManageBooksComponent } from "./features/manage-books/manage-books.component";

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