import { Routes } from "@angular/router";

import { LaunchpadComponent } from "./ctrl-screens/launchpad/launchpad.component";

export const pageRoutes: Routes = [
  {
    path: 'launchpad',
    title: 'Launchpad',
    component: LaunchpadComponent,
  },
] ;