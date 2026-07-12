import { Routes } from "@angular/router";
import { SessionEventsScreenComponent } from "./screens/session-events-screen/session-events-screen.component";
import { DashboardScreenComponent } from "./screens/dashboard-screen/dashboard-screen.component";
import { TopicDetailScreenComponent } from "./screens/topic-detail-screen/topic-detail-screen.component";
import { ProblemBrowserScreenComponent } from "./screens/problem-browser-screen/problem-browser-screen.component";
import { ProblemAttemptsScreenComponent } from "./screens/problem-attempts-screen/problem-attempts-screen.component";
import { ProblemApiService } from "@jee-common/services/problem-api.service";

export const pageRoutes: Routes = [
  {
    path: '',
    redirectTo: 'dashboard',
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
  {
    path: 'topic-detail/:topicId/problems',
    title: 'Problems',
    component: ProblemBrowserScreenComponent,
    providers: [ ProblemApiService ],
  },
  {
    path: 'topic-detail/:topicId/problems/:problemId/attempts',
    title: 'Problem Attempts',
    component: ProblemAttemptsScreenComponent,
    providers: [ ProblemApiService ],
  },
] ;