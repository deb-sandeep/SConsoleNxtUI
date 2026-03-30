import { inject, Injectable } from '@angular/core';

import { ExamAnswerAction, ExamEvent, ExamEventName, ExamEventType, LapName } from "@jee-common/util/exam-data-types" ;
import { ExamApiService } from "@jee-common/services/exam-api.service";
import { ExamQuestion, ExamSection } from "../../../app-jee-exam/src/common/so-wrappers";

@Injectable()
export class EventLogService {
  
  private readonly EVENT_TYPE_MAP : Record<ExamEventName, ExamEventType> = {
    "SAVE_&_NEXT":           "ANS_ACTION",
    "SAVE_&_MARK_REVIEW":    "ANS_ACTION",
    "CLEAR_RESPONSE":        "ANS_ACTION",
    "MARK_REVIEW_&_NEXT":    "ANS_ACTION",

    "GOTO_SECTION_START":    "QUESTION_NAV",
    "GOTO_NEXT_QUESTION":    "QUESTION_NAV",
    "GOTO_PREV_QUESTION":    "QUESTION_NAV",
    "GOTO_PALETTE_QUESTION": "QUESTION_NAV",

    "ANS_ENTERED":           "UI_INTERACTION",
    "SCROLL_QUESTION_DOWN":  "UI_INTERACTION",
    "SCROLL_QUESTION_UP":    "UI_INTERACTION",
    "PALETTE_COLLAPSED":     "UI_INTERACTION",
    "PALETTE_EXPANDED":      "UI_INTERACTION",

    "EXAM_START":            "START_STOP",
    "EXAM_SUBMIT":           "START_STOP",

    "LAP_CHANGE":            "LAP",
    "QUESTION_ACTIVATED":    "Q_ACTIVATION"
  } ;

  apiSvc = inject( ExamApiService ) ;

  examAttemptId: number ;
  eventSequence: number = 0 ;
  startTime: Date ;

  private createEvent( eventName: ExamEventName, payload:any|null = null ) {
    let creationTime = new Date();
    let timeMarker = creationTime.getTime() - this.startTime.getTime() ;
    let payloadStr = payload == null ? "{}" : JSON.stringify(payload);

    return {
      id: -1,
      examAttemptId: this.examAttemptId,
      sequence: ++this.eventSequence,
      eventType: this.EVENT_TYPE_MAP[eventName],
      eventName: eventName,
      payload: payloadStr,
      creationTime: creationTime,
      timeMarker: timeMarker,
    } as ExamEvent ;
  }

  logExamStartEvent() {
    this.apiSvc.logEvent( this.createEvent( "EXAM_START" ) )
        .then()  ;
  }

  logQuestionActivation( question: ExamQuestion ) {
    this.apiSvc.logEvent( this.createEvent( "QUESTION_ACTIVATED", {
      questionNo : question.index,
      examQuestionId : question.questionConfig.id,
      questionId : question.questionConfig.questionId
    }) ).then() ;
  }

  logJumpSection( section: ExamSection ) {
    this.apiSvc.logEvent( this.createEvent( "GOTO_SECTION_START", {
      questionNo : section.firstQuestion.index,
      sectionName : section.sectionName,
    }) ).then() ;
  }

  logJumpNextQuestion( question: ExamQuestion ) {
    let nextQuestionSequence = question.nextQuestion != null ?
                                        question.nextQuestion.index : -1 ;

    this.apiSvc.logEvent( this.createEvent( "GOTO_NEXT_QUESTION", {
      currentQuestionNo : question.index,
      nextQuestionNo : nextQuestionSequence
    }) ).then() ;
  }

  logJumpPreviousQuestion( question: ExamQuestion ) {

    let prevQuestionSequence = question.prevQuestion != null ?
                                        question.prevQuestion.index : -1 ;

    this.apiSvc.logEvent( this.createEvent( "GOTO_PREV_QUESTION", {
      currentQuestionNo : question.index,
      nextQuestionNo : prevQuestionSequence
    }) ).then() ;
  }

  logJumpToPaletteQuestion( question: ExamQuestion ) {
    this.apiSvc.logEvent( this.createEvent( "GOTO_PALETTE_QUESTION", {
      questionNo : question.index,
    }) ).then() ;
  }

  logAnswerEntered( question: ExamQuestion ) {
    this.apiSvc.logEvent( this.createEvent( "ANS_ENTERED", {
      questionNo : question.index,
      answer : question.answer
    }) ).then() ;
  }

  logScrollQuestion( question: ExamQuestion, dir: 'UP' | 'DOWN' ) {
    const eventId = dir === 'UP' ?
      "SCROLL_QUESTION_UP" : "SCROLL_QUESTION_DOWN" ;

    this.apiSvc.logEvent( this.createEvent( eventId, {
      questionNo : question.index
    }) ).then() ;
  }

  logPaletteToggle( collapsed: boolean ) {
    const eventId = collapsed ?
      "PALETTE_COLLAPSED" : "PALETTE_EXPANDED" ;

    this.apiSvc.logEvent( this.createEvent( eventId ) )
        .then() ;
  }

  logAnswerAction( question: ExamQuestion, eventId: ExamAnswerAction ) {
    this.apiSvc.logEvent( this.createEvent( eventId, {
      questionNo : question.index,
      answer : question.answer
    }) ).then() ;
  }

  logLapChange( currentLap: LapName, nextLap: LapName|null ) {
    this.apiSvc.logEvent( this.createEvent( "LAP_CHANGE", {
      currentLap : currentLap,
      nextLap : nextLap
    }) ).then() ;
  }

  async logExamSubmitEvent() {
    await this.apiSvc.logEvent( this.createEvent( "EXAM_SUBMIT" ) );
  }
}