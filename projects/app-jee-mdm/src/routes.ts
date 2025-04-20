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
import { SolvePigeonsComponent } from "./features/solve-pigeons/solve-pigeons.component";
import { SolvePigeonsService } from "./features/solve-pigeons/solve-pigeons.service";
import { ProblemHistoryComponent } from "./features/problem-history/problem-history.component";
import { ProblemHistoryService } from "./features/problem-history/problem-history.service";

export const featureRoutes: Routes = [
    {
        path: '',
        redirectTo: 'solve-pigeons',
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
    {
        path: 'solve-pigeons',
        title: 'Solve Pigeons',
        component: SolvePigeonsComponent,
        providers: [SolvePigeonsService, AlertService]
    },
    {
        path: 'problem-history',
        title: 'Problem History',
        component: ProblemHistoryComponent,
        providers: [ProblemHistoryService, AlertService]
    },
] ;