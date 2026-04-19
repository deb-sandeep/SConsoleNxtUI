import { Component, inject, Input, output } from '@angular/core';
import {
  ExamAttemptSO,
  ExamQuestionAttemptSO,
  ExamSectionAttemptSO, LapName,
} from "@jee-common/util/exam-data-types";
import { NgClass, NgStyle } from "@angular/common";
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
    FormsModule,
    NgStyle
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
  selectedLapName: LapName | "ALL" = "ALL" ;

  rcMap : Record<string, string> = {} ;
  lapNames : LapName[] = [] ;

  ngOnInit() {
    this.examSvc.loadRootCauses().then( () => {
      for( let rootCause of this.examSvc.rootCauses ) {
        this.rcMap[ rootCause.cause ] = rootCause.group ;
      }
    } ) ;
  }

  ngOnChanges() {
    this.sectionAttempts.length = 0 ;
    for( let attempt of this.eval!.sectionAttempts ) {
      this.sectionAttempts.push( new ExamSection( attempt ) );
    }

    let firstQAttempt = this.sectionAttempts[0].questionAttempts[0] ;
    for( let lapName of ['L1', 'L2P', 'L2', 'AMR', 'L3P', 'L3.1', 'L3.2' ] as LapName[] ) {
      if( lapName in firstQAttempt.lapDurations ) {
        this.lapNames.push( lapName ) ;
      }
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

  public selectQuestionAttempt( qAttempt: ExamQuestionAttemptSO ) {
    this.selectedAttempt = qAttempt ;
    this.questionSelected.emit( qAttempt ) ;
  }

  protected isAttemptCorrect( qAttempt: ExamQuestionAttemptSO ) {
    return qAttempt.evaluationStatus == "CORRECT" ;
  }

  protected rootCauseAssigned( qAttempt: ExamQuestionAttemptSO ) {
    this.apiSvc
        .updateAttemptRootCause( qAttempt.id, qAttempt.rootCause! )
        .then( ( res ) => {
      this.examSvc.repopulateExamEvaluation( this.eval, res ) ;
    }) ;
  }

  protected getScoreBoundaryStyle( qAttempt: ExamQuestionAttemptSO ) {
    if( qAttempt.rootCause != null ) {
      let borderColor = "#ff8181" ;
      let bgColor = "#fbcfcf" ;

      if( this.rcMap[ qAttempt.rootCause ] === "AVOIDABLE" ) {
        borderColor = "#8eca8e" ;
        bgColor = "#e0ffe0" ;
      }
      return {
        "border" : `2px solid ${borderColor}`,
        "background-color": `${bgColor}`,
      }
    }
    return null ;
  }

  protected getAvoidableLossColor( qAttempt: ExamQuestionAttemptSO ) {
    let bgColor = "#ffffff" ;
    if( qAttempt.avoidableLoss > 0 ) {
        bgColor = "#ff0000" ;
    }
    return bgColor ;
  }

  protected getRootCauseBgColor( qAttempt: ExamQuestionAttemptSO ) {
    let bgColor = "#cccccc" ;
    if( qAttempt.rootCause != null ) {
      bgColor = qAttempt.avoidableLoss > 0 ? "#fb9d9d" : "#b3e7fd" ;
    }
    return bgColor ;
  }

  protected isVisible( qAttempt: ExamQuestionAttemptSO ) {
    if( this.selectedLapName === "ALL" ) return true ;
    return (qAttempt.lapDurations[ this.selectedLapName ] ?? 0) > 0 ;
  }

  protected hasSectionVisibleAttempts( section: ExamSection ) {
    return section.questionAttempts.some( qa => this.isVisible( qa ) ) ;
  }

  protected getSubmitLapBgColor( lapName: LapName ) {
    switch( lapName ) {
      case "L1"  : return "rgb(207 207 207 / 0.5)" ;
      case "L2P" : return "rgb(100 180 255 / 0.32)" ;
      case "L2"  : return "rgb(255 101 149 / 0.35)" ;
      case "AMR" : return "rgb(3 248 3 / 0.18)" ;
      case "L3P" : return "rgb(196 124 251 / 0.24)" ;
      case "L3.1": return "rgb(255 255 0 / 0.19)" ;
      case "L3.2": return "rgb(0 255 255 / 0.21)" ;
      default    : return "#ffffff" ;
    }
  }
}
