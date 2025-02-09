import { Component, inject } from '@angular/core';

import { Alert, AlertsDisplayComponent, PageTitleComponent, PageTitleService, PageToolbarComponent } from "lib-core";
import AlertService = Alert.AlertService;

import { ManageTracksService } from "./manage-tracks.service";
import { Syllabus, Topic } from "../../base-types";
import { Track } from "./manage-tracks.types";

@Component({
  selector: 'app-manage-tracks',
  imports: [ PageTitleComponent, AlertsDisplayComponent, PageToolbarComponent ],
  templateUrl: './manage-tracks.component.html',
  styleUrl: './manage-tracks.component.css'
})
export class ManageTracksComponent {

  private alertSvc = inject( AlertService ) ;
  private titleSvc : PageTitleService = inject( PageTitleService ) ;
  private manageTracksSvc:ManageTracksService = inject( ManageTracksService ) ;

  syllabusList:Syllabus[] = [] ;
  trackList:Track[] = [] ;
  syllabusTopics:Record<string, Topic[]> = {} ;

  constructor() {
    this.titleSvc.setTitle( 'Manage Tracks' ) ;
    this.manageTracksSvc.getAllSyllabus()
      .then( syllabusList => this.syllabusList = syllabusList )
      .then( () => this.manageTracksSvc.getAllTracks() )
      .then( tracks => this.trackList = tracks )
      .then( () => this.postProcessInitializationData() )
      .catch( err => this.alertSvc.error( 'Error : ' + err) ) ;
  }

  private postProcessInitializationData() {
    this.syllabusList.forEach( syllabus => this.syllabusTopics[ syllabus.syllabusName ] = syllabus.topics ) ;
  }
}
