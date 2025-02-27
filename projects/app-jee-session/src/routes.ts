import { Routes } from "@angular/router";

import { LandingComponent } from "./pages/landing/landing.component";
import { ProblemSelectionComponent } from "./pages/problem-selection/problem-selection.component";
import { ExerciseSessionComponent } from "./pages/session/exercise-session/exercise-session.component";
import { NonExerciseSessionComponent } from "./pages/session/non-exercise-session/non-exercise-session.component";

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
    path: 'exercise-session',
    title: 'Exercise Session',
    component: ExerciseSessionComponent,
    children: [
      {
        path: 'problem-selection',
        title: 'Select Problem',
        component: ProblemSelectionComponent,
      },
    ]
  },
  {
    path: 'non-exercise-session',
    title: 'Study Session',
    component: NonExerciseSessionComponent,
  },
] ;