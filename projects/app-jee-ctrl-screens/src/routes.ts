import { Routes } from "@angular/router";

import { LaunchpadComponent } from "./ctrl-screens/launchpad/launchpad.component";
import { SessionScreenComponent } from "./ctrl-screens/session/session-screen.component";

export const pageRoutes: Routes = [
  {
    path: 'launchpad',
    title: 'Launchpad',
    component: LaunchpadComponent,
  },
  {
    path: 'session-screen',
    title: 'Session',
    component: SessionScreenComponent,
  },
] ;