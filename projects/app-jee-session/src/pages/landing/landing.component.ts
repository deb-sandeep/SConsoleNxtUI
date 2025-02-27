import { Component, inject } from '@angular/core';
import { SessionStateService } from "../../service/session-state.service";
import { DatePipe, NgOptimizedImage, NgStyle } from "@angular/common";
import { SessionTypeSO, SyllabusSO, TopicSO } from "@jee-common/master-data-types";
import { Router } from "@angular/router";

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
  router: Router = inject( Router ) ;

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
    const width = `calc( ${height}*1.5 )` ;
    return {
      'background-color':s.color,
      'height': height,
      'width': width,
    }
  }

  getActiveTopicStyle( syllabus:SyllabusSO) {
    const height = this.getCSSHeight( 3 ) ;
    const stWidth = this.getCSSHeight( this.stateSvc.sessionTypes.length ) ;
    const syllabusWidth = `calc( (${this.getCSSHeight( this.stateSvc.syllabuses.length )})*1.5 )` ;
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
    const syllabusWidth = `calc( (${this.getCSSHeight( this.stateSvc.syllabuses.length )})*1.5 )` ;
    const width = `calc( 100dvw - ${syllabusWidth} - ${stWidth} - calc(var(--tile-padding)*12) )` ;
    return {
      'height': height,
      'width': width
    }
  }

  async topicSelected( t: TopicSO ) {
    await this.stateSvc.setSelectedTopic( t ) ;
    let sessionType = this.stateSvc.session.sessionType!.sessionType ;
    if( sessionType === 'Exercise' ) {
      await this.router.navigate( [ '../exercise-session' ] ) ;
    }
    else if( ['Theory','Coaching'].includes( sessionType ) ) {
      await this.router.navigate( [ '../non-exercise-session' ] ) ;
    }
  }

  private getCSSHeight( numDivisions:number ) {
    return `calc( (100dvh - var(--tile-padding)*${numDivisions+1} ) / ${numDivisions})` ;
  }
}
