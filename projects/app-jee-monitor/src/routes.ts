import { Routes } from "@angular/router";
import { SessionEventsScreenComponent } from "./screens/session-events-screen/session-events-screen.component";
import { DashboardScreenComponent } from "./screens/dashboard-screen/dashboard-screen.component";

export const pageRoutes: Routes = [
  {
    path: '',
    redirectTo: 'session-events',
    pathMatch: 'full'
  },
  {
    path: 'session-events',
    title: 'Study Events',
    component: SessionEventsScreenComponent,
  },
  {
    path: 'dashboard',
    title: 'Dashboard',
    component: DashboardScreenComponent,
  },
] ;