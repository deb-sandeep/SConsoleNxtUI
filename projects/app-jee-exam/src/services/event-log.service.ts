import { inject, Injectable } from '@angular/core';

import { ExamAnswerAction, ExamEvent, ExamEventID, LapName } from "@jee-common/util/exam-data-types" ;
import { ExamApiService } from "./exam-api.service";
import { ExamQuestion, ExamSection } from "../common/so-wrappers";

@Injectable()
export class EventLogService {

  apiSvc = inject( ExamApiService ) ;

  examAttemptId: number ;
  eventSequence: number = 0 ;
  startTime: Date ;

  private createEvent( eventId: ExamEventID, payload:any|null = null ) {
    let creationTime = new Date();
    let timeMarker = creationTime.getTime() - this.startTime.getTime() ;
    let payloadStr = payload == null ? "{}" : JSON.stringify(payload);

    return {
      id: -1,
      examAttemptId: this.examAttemptId,
      sequence: ++this.eventSequence,
      eventId: eventId,
      payload: payloadStr,
      creationTime: creationTime,
      timeMarker: timeMarker,
    } as ExamEvent ;
  }

  logExamStartEvent() {
    this.apiSvc.logEvent( this.createEvent( "EXAM_START" ) )
        .then( ()=> console.log( 'Event: EXAM_START' ) )  ;
  }

  logQuestionActivation( question: ExamQuestion ) {
    this.apiSvc.logEvent( this.createEvent( "QUESTION_ACTIVATED", {
      questionSequence : question.index,
      examQuestionId : question.questionConfig.id,
      questionId : question.questionConfig.questionId
    }) ).then( ()=> console.log( 'Event: QUESTION_ACTIVATED' ) ) ;
  }

  logJumpSection( section: ExamSection ) {
    this.apiSvc.logEvent( this.createEvent( "SECTION_JUMPED", {
      sectionName : section.sectionName,
      questionSequence : section.firstQuestion.index,
    }) ).then( ()=> console.log( 'Event: SECTION_JUMPED' ) ) ;
  }

  logJumpNextQuestion( question: ExamQuestion ) {
    let nextQuestionSequence = question.nextQuestion != null ?
                                        question.nextQuestion.index : -1 ;

    this.apiSvc.logEvent( this.createEvent( "NEXT_QUESTION", {
      currentQuestionSequence : question.index,
      nextQuestionSequence : nextQuestionSequence
    }) ).then( ()=> console.log( 'Event: NEXT_QUESTION' ) ) ;
  }

  logJumpPreviousQuestion( question: ExamQuestion ) {

    let prevQuestionSequence = question.prevQuestion != null ?
                                        question.prevQuestion.index : -1 ;

    this.apiSvc.logEvent( this.createEvent( "PREV_QUESTION", {
      currentQuestionSequence : question.index,
      nextQuestionSequence : prevQuestionSequence
    }) ).then( ()=> console.log( 'Event: PREV_QUESTION' ) ) ;
  }

  logAnswerEntered( question: ExamQuestion ) {
    this.apiSvc.logEvent( this.createEvent( "ANS_ENTERED", {
      questionSequence : question.index,
      answer : question.answer
    }) ).then( ()=> console.log( 'Event: ANS_ENTERED' ) ) ;
  }

  logScrollQuestion( question: ExamQuestion, dir: 'UP' | 'DOWN' ) {
    const eventId = dir === 'UP' ?
      "SCROLL_QUESTION_UP" : "SCROLL_QUESTION_DOWN" ;

    this.apiSvc.logEvent( this.createEvent( eventId, {
      questionSequence : question.index
    }) ).then( ()=> console.log( `Event: ${eventId}` ) ) ;
  }

  logPaletteToggle( collapsed: boolean ) {
    const eventId = collapsed ?
      "PALETTE_COLLAPSED" : "PALETTE_EXPANDED" ;

    this.apiSvc.logEvent( this.createEvent( eventId ) )
        .then( ()=> console.log( `Event: ${eventId}` ) ) ;
  }

  logAnswerAction( question: ExamQuestion, eventId: ExamAnswerAction ) {
    this.apiSvc.logEvent( this.createEvent( eventId, {
      questionSequence : question.index,
      answer : question.answer
    }) ).then( ()=> console.log( `Event: ${eventId}` ) ) ;
  }

  logLapChange( currentLap: LapName, nextLap: LapName|null ) {
    this.apiSvc.logEvent( this.createEvent( "LAP_CHANGE", {
      currentLap : currentLap,
      nextLap : nextLap
    }) ).then( ()=> console.log( `Event: LAP_CHANGE` ) ) ;
  }
}