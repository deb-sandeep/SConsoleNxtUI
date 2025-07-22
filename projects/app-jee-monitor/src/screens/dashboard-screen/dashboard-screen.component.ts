import { Component, inject } from '@angular/core';
import { StateService } from "../../service/state.service";
import { UIHelperService } from "../../service/ui-helper.service";
import { BurnBarComponent } from "./widgets/burn-bar/burn-bar.component";
import { DurationPipe } from "lib-core";
import { NgIf } from "@angular/common";

@Component({
  selector: 'app-dashboard-screen',
  imports: [
    BurnBarComponent,
    DurationPipe,
    NgIf
  ],
  templateUrl: './dashboard-screen.component.html',
  styleUrl: './dashboard-screen.component.css'
})
export class DashboardScreenComponent {

  stateSvc: StateService = inject( StateService ) ;
  uiSvc: UIHelperService = inject( UIHelperService ) ;

  constructor() {}

  protected readonly Math = Math;
}
