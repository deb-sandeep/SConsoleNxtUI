import { Component, inject } from '@angular/core';

import { AlertsDisplayComponent, PageTitleComponent, PageTitleService } from "lib-core";

import { ManageTracksService } from "./manage-tracks.service";
import { ConfigPaneComponent } from "./components/config-pane/config-pane.component";
import { TrackComponent } from "./components/track/track.component";
import { TopicScheduleGanttComponent } from "./components/topic-schedule-gantt/topic-schedule-gantt.component";
import { NgIf } from "@angular/common";

@Component({
  selector: 'manage-tracks',
  imports: [
    PageTitleComponent,
    AlertsDisplayComponent,
    ConfigPaneComponent,
    TrackComponent,
    TopicScheduleGanttComponent,
    NgIf
  ],
  templateUrl: './manage-tracks.component.html',
  styleUrl: './manage-tracks.component.css'
})
export class ManageTracksComponent {

  private static readonly DEFAULT_GANTT_PANEL_HEIGHT = 400 ;

  private titleSvc : PageTitleService = inject( PageTitleService ) ;

  public svc:ManageTracksService = inject( ManageTracksService ) ;

  trackPanelWidth = '80%' ;
  configPanelWidth = '20%' ;
  ganttPanelHeight = ManageTracksComponent.DEFAULT_GANTT_PANEL_HEIGHT ;

  private lastSavedGanttPanelHeight = ManageTracksComponent.DEFAULT_GANTT_PANEL_HEIGHT ;

  constructor() {
    this.titleSvc.setTitle( "Manage Tracks" ) ;
    this.svc.refreshInitializationData()
        .then( () => this.svc.selectDefaultSyllabus() ) ;
  }

  toggleConfigPane() {
    if( this.isConfigPaneVisible() ) {
      this.configPanelWidth = '0%' ;
      this.trackPanelWidth = '100%' ;
    }
    else {
      this.configPanelWidth = '20%' ;
      this.trackPanelWidth = '80%' ;
    }
  }

  toggleGanttPane() {
    if( this.isGanttPaneVisible() ) {
      this.lastSavedGanttPanelHeight = this.ganttPanelHeight ;
      this.ganttPanelHeight = 0 ;
    }
    else {
      this.ganttPanelHeight = this.lastSavedGanttPanelHeight ;
    }
  }

  decreaseGanttPaneHeight() {
    this.ganttPanelHeight -= 50 ;
    if( this.ganttPanelHeight < 0 ) {
      this.ganttPanelHeight = 0 ;
    }
  }

  increaseGanttPaneHeight() {
    this.ganttPanelHeight += 50 ;
    if( this.ganttPanelHeight > 1000 ) {
      this.ganttPanelHeight = 1000 ;
    }
  }

  getTrackPanelHeight() {
    return `calc(100% - var(--page-title-height) - ${this.ganttPanelHeight}px)` ;
  }

  isConfigPaneVisible() {
    return this.configPanelWidth === '20%' ;
  }

  isGanttPaneVisible() {
    return this.ganttPanelHeight > 0 ;
  }

}
