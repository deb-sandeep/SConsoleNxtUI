import { Routes } from "@angular/router";

import { LandingComponent } from "./pages/landing/landing.component";
import { ProblemPickerComponent } from "./pages/session/widgets/problem-picker/problem-picker.component";
import { ExerciseSessionComponent } from "./pages/session/exercise-session/exercise-session.component";
import { TheorySessionComponent } from "./pages/session/theory-session/theory-session.component";
import { CoachingSessionComponent } from "./pages/session/coaching-session/coaching-session.component";

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
    component: ExerciseSessionComponent
  },
  {
    path: 'theory-session',
    title: 'Theory Session',
    component: TheorySessionComponent,
  },
  {
    path: 'coaching-session',
    title: 'Coaching Session',
    component: CoachingSessionComponent,
  },
] ;