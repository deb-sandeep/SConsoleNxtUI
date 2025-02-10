import { Component, inject } from '@angular/core';

import { AlertsDisplayComponent, PageTitleComponent, PageTitleService } from "lib-core";

import { ManageTracksService } from "./manage-tracks.service";
import { ConfigPaneComponent } from "./components/config-pane/config-pane.component";
import { TrackComponent } from "./components/track/track.component";

@Component({
  selector: 'manage-tracks',
  imports: [
    PageTitleComponent,
    AlertsDisplayComponent,
    ConfigPaneComponent,
    TrackComponent
  ],
  templateUrl: './manage-tracks.component.html',
  styleUrl: './manage-tracks.component.css'
})
export class ManageTracksComponent {

  private titleSvc : PageTitleService = inject( PageTitleService ) ;

  public svc:ManageTracksService = inject( ManageTracksService ) ;

  constructor() {
    this.titleSvc.setTitle( "Manage Tracks" ) ;
    this.svc.fetchInitializationData() ;
  }
}
