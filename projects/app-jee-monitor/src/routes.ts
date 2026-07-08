import { Routes } from "@angular/router";
import { SessionEventsScreenComponent } from "./screens/session-events-screen/session-events-screen.component";
import { DashboardScreenComponent } from "./screens/dashboard-screen/dashboard-screen.component";
import { TopicDetailScreenComponent } from "./screens/topic-detail-screen/topic-detail-screen.component";

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
  {
    path: 'topic-detail/:topicId',
    title: 'Topic Detail',
    component: TopicDetailScreenComponent,
  },
] ;