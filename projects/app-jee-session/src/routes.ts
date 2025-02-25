import { Routes } from "@angular/router";

import { LandingComponent } from "./pages/landing/landing.component";
import { ProblemSelectionComponent } from "./pages/problem-selection/problem-selection.component";
import { TheorySessionComponent } from "./pages/theory-session/theory-session.component";
import { NumericalSessionComponent } from "./pages/numerical-session/numerical-session.component";
import { CoachingSessionComponent } from "./pages/coaching-session/coaching-session.component";

export const pageRoutes: Routes = [
  {
    path: '',
    redirectTo: 'landing',
    pathMatch: 'full'
  },
  {
    path: 'landing',
    title: 'New Session',
    component: LandingComponent,
  },
  {
    path: 'problem-selection',
    title: 'Select Problem',
    component: ProblemSelectionComponent,
  },
  {
    path: 'theory-session',
    title: 'Theory Session',
    component: TheorySessionComponent,
  },
  {
    path: 'numerical-session',
    title: 'Numerical Session',
    component: NumericalSessionComponent,
  },
  {
    path: 'coaching-session',
    title: 'Coaching Session',
    component: CoachingSessionComponent,
  },
] ;