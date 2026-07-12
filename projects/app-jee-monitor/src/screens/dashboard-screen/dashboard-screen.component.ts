import { Component, inject } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
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
    NgIf,
    RouterLink
  ],
  templateUrl: './dashboard-screen.component.html',
  styleUrl: './dashboard-screen.component.css'
})
export class DashboardScreenComponent {

  stateSvc: StateService = inject( StateService ) ;
  uiSvc: UIHelperService = inject( UIHelperService ) ;
  private router = inject( Router ) ;

  constructor() {}

  protected readonly Math = Math;

  onPigeonClick( event: Event, topicId: number ) {
    event.stopPropagation() ;
    this.router.navigate( ['/topic-detail', topicId, 'problems'], { queryParams: { filter: 'pigeon', origin: 'dashboard' } } ) ;
  }
}
