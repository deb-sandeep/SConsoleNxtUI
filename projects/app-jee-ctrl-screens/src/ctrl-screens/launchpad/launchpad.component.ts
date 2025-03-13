import { Component, inject } from '@angular/core';
import { StateService } from "../../service/state.service";
import { TargetScreenBtnComponent } from "./target-screen-btn/target-screen-btn.component";

@Component({
  selector: 'launchpad',
  imports: [
    TargetScreenBtnComponent
  ],
  templateUrl: './launchpad.component.html',
  styles: `
  .jump-screen-body {
      margin: 20px 20px 20px 40px ;
  }
  `
})
export class LaunchpadComponent {

  stateSvc:StateService = inject( StateService ) ;

  constructor() {
  }
}
