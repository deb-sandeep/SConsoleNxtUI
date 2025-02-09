import { Component, inject, signal } from '@angular/core';

import { Alert, AlertsDisplayComponent, PageTitleComponent, PageTitleService } from "lib-core";
import AlertService = Alert.AlertService;

import { ManageTracksService } from "./manage-tracks.service";
import { ConfigPaneComponent } from "./components/config-pane/config-pane.component";

@Component({
  selector: 'app-manage-tracks',
  imports: [
    PageTitleComponent,
    AlertsDisplayComponent,
    ConfigPaneComponent
  ],
  templateUrl: './manage-tracks.component.html',
  styleUrl: './manage-tracks.component.css'
})
export class ManageTracksComponent {

  private alertSvc = inject( AlertService ) ;
  private titleSvc : PageTitleService = inject( PageTitleService ) ;

  public svc:ManageTracksService = inject( ManageTracksService ) ;

  constructor() {
    this.titleSvc.setTitle( "Manage Tracks" ) ;
    this.svc.getAllSyllabus()
        .then( syllabusList => this.svc.syllabusList = syllabusList )
        .then( () => this.svc.getAllTracks() )
        .then( tracks => this.svc.trackList = tracks )
        .then( () => this.svc.postProcessInitializationData() )
        .catch( err => this.alertSvc.error( 'Error : ' + err) ) ;
  }

  public getTrackWidth():string {
    let numTracks = this.svc.syllabusTracks[this.svc.selectedSyllabus()].length ;
    return `calc(100%/${numTracks})` ;
  }
}
