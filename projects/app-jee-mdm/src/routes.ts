import { Routes } from "@angular/router";
import { ManageBooksComponent } from "./features/manage-books/manage-books.component";

import { ManageBooksService } from "./features/manage-books/manage-books.service";
import { Alert } from "lib-core";

import AlertService = Alert.AlertService;
import { manageBooksRoutes } from "./features/manage-books/manage-books.route" ;

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
        children: manageBooksRoutes,
        providers: [ManageBooksService, AlertService]
    },
] ;