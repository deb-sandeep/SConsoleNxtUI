import { Component, inject } from '@angular/core';
import { SessionStateService } from "../../service/session-state.service";
import { DatePipe, NgOptimizedImage, NgStyle } from "@angular/common";
import { SessionTypeSO, SyllabusSO } from "@jee-common/master-data-types";
import { stat } from "ng-packagr/lib/utils/fs";

@Component({
  selector: 'landing',
  imports: [
    NgOptimizedImage,
    NgStyle,
    DatePipe
  ],
  templateUrl: './landing.component.html',
  styleUrl: './landing.component.css'
})
export class LandingComponent {

  stateSvc:SessionStateService = inject( SessionStateService ) ;

  constructor() {
    this.stateSvc.loadMasterData().then() ;
  }

  getSTStyle( st:SessionTypeSO ) {
    const length = this.getCSSHeight( this.stateSvc.sessionTypes.length ) ;
    return {
      'background-color':st.color,
      'height': length,
      'width': length,
    }
  }

  getSyllabusStyle( s:SyllabusSO ) {
    const height = this.getCSSHeight( this.stateSvc.syllabuses.length ) ;
    const width = `calc( ${height}*2 )` ;
    return {
      'background-color':s.color,
      'height': height,
      'width': width,
    }
  }

  getActiveTopicStyle( syllabus:SyllabusSO) {
    const height = this.getCSSHeight( 3 ) ;
    const stWidth = this.getCSSHeight( this.stateSvc.sessionTypes.length ) ;
    const syllabusWidth = `calc( (${this.getCSSHeight( this.stateSvc.syllabuses.length )})*2 )` ;
    const width = `calc( 100dvw - ${syllabusWidth} - ${stWidth} - calc(var(--tile-padding)*12) )` ;
    return {
      'background-color':syllabus.color,
      'height': height,
      'width': width
    }
  }

  getInactiveTopicsContainerStyle() {
    const height = this.getCSSHeight( 3 ) ;
    const stWidth = this.getCSSHeight( this.stateSvc.sessionTypes.length ) ;
    const syllabusWidth = `calc( (${this.getCSSHeight( this.stateSvc.syllabuses.length )})*2 )` ;
    const width = `calc( 100dvw - ${syllabusWidth} - ${stWidth} - calc(var(--tile-padding)*12) )` ;
    return {
      'height': height,
      'width': width
    }
  }

  private getCSSHeight( numDivisions:number ) {
    return `calc( (100dvh - var(--tile-padding)*${numDivisions+1} - var(--page-header-height)) / ${numDivisions})` ;
  }
}
