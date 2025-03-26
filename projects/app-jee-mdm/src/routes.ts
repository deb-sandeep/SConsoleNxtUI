import { Routes } from "@angular/router";
import { Alert } from "lib-core";

import AlertService = Alert.AlertService;

import { ManageBooksComponent } from "./features/manage-books/manage-books.component";
import { ManageBooksService } from "./features/manage-books/manage-books.service";
import { manageBooksRoutes } from "./features/manage-books/manage-books.route" ;

import { ManageProblemsComponent } from "./features/manage-problems/manage-problems.component";
import { ManageProblemsService } from "./features/manage-problems/manage-problems.service";
import { manageProblemsRoutes } from "./features/manage-problems/manage-problems.route";
import { ManageTracksComponent } from "./features/manage-tracks/manage-tracks.component";
import { ManageTracksService } from "./features/manage-tracks/manage-tracks.service";

export const featureRoutes: Routes = [
    {
        path: '',
        redirectTo: 'manage-tracks',
        pathMatch: 'full'
    },
    {
        path: 'manage-books',
        title: 'Manage Books',
        component: ManageBooksComponent,
        children: manageBooksRoutes,
        providers: [ManageBooksService, AlertService]
    },
    {
        path: 'manage-problems',
        title: 'Manage Problems',
        component: ManageProblemsComponent,
        children: manageProblemsRoutes,
        providers: [ManageProblemsService, AlertService]
    },
    {
        path: 'manage-tracks',
        title: 'Manage Tracks',
        component: ManageTracksComponent,
        providers: [ManageTracksService, AlertService]
    },
] ;