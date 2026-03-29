import { Component, inject, Input, output } from '@angular/core';
import {
  ExamAttemptSO,
  ExamQuestionAttemptSO,
  ExamSectionAttemptSO,
} from "@jee-common/util/exam-data-types";
import { NgClass } from "@angular/common";
import { DurationPipe } from "lib-core";
import { FormsModule } from "@angular/forms";
import { ExamApiService } from "@jee-common/services/exam-api.service";
import { JeeBaseService } from "@jee-common/services/jee-base.service";

class ExamSection {

  sectionName: string ;
  collapsed: boolean ;
  questionAttempts: ExamQuestionAttemptSO[] ;
  bgColor: string ;

  constructor( sectionAttempt: ExamSectionAttemptSO ) {
    this.sectionName = this.constructSectionName( sectionAttempt ) ;
    this.questionAttempts = sectionAttempt.questionAttempts ;
    this.bgColor = this.deduceBgColor() ;
    this.collapsed = false ;
  }

  private constructSectionName( sAttempt: ExamSectionAttemptSO ) {
    const syllabus = sAttempt.examSection.syllabusName ;
    const problemType = sAttempt.examSection.problemType ;
    return syllabus.substring( 4 ) + " : " + problemType ;
  }

  private deduceBgColor() {
    if( this.sectionName.startsWith( 'Physics' ) ) {
      return "#fdd28c" ;
    }
    else if( this.sectionName.startsWith( 'Chemistry' ) ) {
      return "#b5ffb6" ;
    }
    return "#b9e4ff" ;
  }

  getTweakieClass() {
    return this.collapsed ? "bi-caret-right-fill tweakie" :
                            "bi-caret-down-fill tweakie" ;
  }
}

@Component({
  selector: 'div[questionEval]',
  imports: [
    NgClass,
    DurationPipe,
    FormsModule
  ],
  templateUrl: './question-eval.component.html',
  styleUrl: './question-eval.component.css'
})
export class QuestionEvalComponent {

  apiSvc = inject( ExamApiService ) ;
  examSvc = inject( JeeBaseService ) ;

  @Input()
  eval: ExamAttemptSO ;

  questionSelected = output<ExamQuestionAttemptSO>() ;

  sectionAttempts: ExamSection[] = [] ;
  selectedAttempt: ExamQuestionAttemptSO | null = null ;

  ngOnChanges() {
    for( let attempt of this.eval!.sectionAttempts ) {
      this.sectionAttempts.push( new ExamSection( attempt ) );
    }
  }

  protected getAnsProvidedBgColor( qAttempt: ExamQuestionAttemptSO ) {
    if( qAttempt.answerSubmitStatus == "ANSWERED" ||
        qAttempt.answerSubmitStatus == "ANS_AND_MARKED_FOR_REVIEW" ) {
      if( qAttempt.evaluationStatus == "CORRECT" ) {
        return "#bcffbf" ;
      }
      else if( qAttempt.evaluationStatus == "INCORRECT" ) {
        return "#ffabb7" ;
      }
      else if( qAttempt.evaluationStatus == "PARTIAL" ) {
        return "#fdd7a4" ;
      }
    }
    return "#b6b6b6" ;
  }

  protected getScoreColor( qAttempt: ExamQuestionAttemptSO ) {
    if( qAttempt.answerSubmitStatus == "ANSWERED" ||
      qAttempt.answerSubmitStatus == "ANS_AND_MARKED_FOR_REVIEW" ) {
      if( qAttempt.evaluationStatus == "CORRECT" ) {
        return "#006705" ;
      }
      else if( qAttempt.evaluationStatus == "INCORRECT" ) {
        return "#980013" ;
      }
      else if( qAttempt.evaluationStatus == "PARTIAL" ) {
        return "#c67300" ;
      }
    }
    return "#a3a3a3" ;
  }

  protected getTimeTakenColor( qAttempt: ExamQuestionAttemptSO ) {
    if( qAttempt.timeSpent > 4*60 ) {
      return "#8e0707" ;
    }
    return "#065506" ;
  }

  protected selectQuestionAttempt( qAttempt: ExamQuestionAttemptSO ) {
    this.selectedAttempt = qAttempt ;
    this.questionSelected.emit( qAttempt ) ;
  }

  protected isAttemptCorrect( qAttempt: ExamQuestionAttemptSO ) {
    return qAttempt.evaluationStatus == "CORRECT" ;
  }

  protected rootCauseAssigned( qAttempt: ExamQuestionAttemptSO ) {
    this.apiSvc
        .updateAttemptRootCause( qAttempt.id, qAttempt.rootCause! )
        .then( () => {
      this.examSvc.recomputeLossAttributionPct() ;
    }) ;
  }
}
