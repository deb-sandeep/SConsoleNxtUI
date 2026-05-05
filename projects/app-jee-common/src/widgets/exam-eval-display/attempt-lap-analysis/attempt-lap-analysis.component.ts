import { Component, inject } from '@angular/core';
import {
  ExamQuestionAttemptLapAnalysisSO,
  ExamQuestionAttemptSO,
  LapName,
} from "@jee-common/util/exam-data-types";
import { NgbRating } from "@ng-bootstrap/ng-bootstrap";
import { FormsModule } from "@angular/forms";
import { ExamApiService } from "@jee-common/services/exam-api.service";
import { NgIf } from "@angular/common";
import { DurationPipe } from "lib-core";

const LAP_ORDER: LapName[] = ['L1', 'L2P', 'L2', 'AMR', 'L3P', 'L3.1', 'L3.2'] ;

@Component({
  selector: 'div[qAttemptLapAnalysis]',
  imports: [ NgbRating, FormsModule, NgIf, DurationPipe ],
  templateUrl: './attempt-lap-analysis.component.html',
  styleUrl: './attempt-lap-analysis.component.css'
})
export class AttemptLapAnalysisComponent {

  readonly execScoreCells = Array.from( { length: 10 }, ( _, i ) => i ) ;

  apiSvc = inject( ExamApiService ) ;

  observationTagsMaster: string[] = [] ;

  questionAttempt: ExamQuestionAttemptSO | null = null ;
  visibleLaps: LapName[] = [] ;
  activeLap: LapName | null = null ;
  workingCopies: Record<string, ExamQuestionAttemptLapAnalysisSO> = {} ;

  dirtyLaps = new Set<string>() ;

  ngOnInit() {
    this.apiSvc.getQAttemptLapAnalysisObservationList().then( result => {
      this.observationTagsMaster = result ;
    }) ;
  }

  // Called by the parent (exam-eval-display) when the user selects a different question.
  setQuestionAttempt( attempt: ExamQuestionAttemptSO ) {
    this.questionAttempt = attempt ;
    this.workingCopies = {} ;
    this.dirtyLaps.clear() ;
    this.visibleLaps = LAP_ORDER.filter( lap => (attempt.lapDurations[ lap ] ?? 0) > 0 ) ;
    this.activeLap = this.visibleLaps[0] ?? null ;
    if( this.activeLap ) {
      this.ensureWorkingCopy( this.activeLap ) ;
    }
  }

  // Lazily initialises the in-memory working copy for a lap on the first visit.
  // Clones observations[] so edits don't mutate the original lapAnalysis from the server payload.
  private ensureWorkingCopy( lap: LapName ) {
    if( this.workingCopies[ lap ] ) return ;

    const existing = this.questionAttempt!.lapAnalysis?.[ lap ] ;
    this.workingCopies[ lap ] = existing
      ? { ...existing, observations: [ ...existing.observations ] }
      : { lapName: lap, score: 0, note: '', observations: [] } ;
  }

  // Called when the user clicks a lap tab. Auto-saves the outgoing tab if dirty before switching.
  protected switchTab( lap: LapName ) {
    if( this.activeLap && this.dirtyLaps.has( this.activeLap ) ) {
      this.saveLap( this.activeLap ) ;
    }
    this.ensureWorkingCopy( lap ) ;
    this.activeLap = lap ;
  }

  // Convenience accessor used by the template to bind form controls to the active lap's working copy.
  protected get currentAnalysis(): ExamQuestionAttemptLapAnalysisSO | null {
    return this.activeLap ? ( this.workingCopies[ this.activeLap ] ?? null ) : null ;
  }

  // Derives the tags not yet selected for the active lap; drives the clickable pool (section F).
  protected get availableObservations(): string[] {
    const selected = new Set( this.currentAnalysis?.observations ?? [] ) ;
    return this.observationTagsMaster.filter( o => !selected.has( o ) ) ;
  }

  // Marks the active lap dirty, turning its tab red and enabling the save icon.
  // Called by every form control that mutates the working copy (rating, textarea, tag add/remove).
  protected markDirty() {
    if( this.activeLap ) this.dirtyLaps.add( this.activeLap ) ;
  }

  // Called when the user clicks a tag in the available pool (F); moves it to the selected chips (E).
  protected addObservation( obs: string ) {

    this.currentAnalysis!.observations.push( obs ) ;

    if( obs === 'PERFECT_EXECUTION' ) {
      this.currentAnalysis!.score = 10 ;
    }
    else {
      this.currentAnalysis!.score = 2 ;
    }

    this.markDirty() ;

    if( obs === 'PERFECT_EXECUTION' ) {
      const indexOfActiveLap = this.visibleLaps.indexOf( this.activeLap! ) ;
      const indexOfNextLap = indexOfActiveLap + 1 ;
      const nextLap = this.visibleLaps[ indexOfNextLap ] ;

      if( nextLap ) {
        // switchTab auto-saves the dirty current lap before switching
        this.switchTab( nextLap ) ;
      }
      else {
        this.saveLap( this.activeLap! ) ;
      }
    }
  }

  // Called when the user clicks × on a selected chip (E); returns the tag to the available pool (F).
  protected removeObservation( obs: string ) {
    if( !this.currentAnalysis ) return ;
    this.currentAnalysis.observations = this.currentAnalysis.observations.filter( o => o !== obs ) ;
    this.markDirty() ;
  }

  // Drives the red tab colour and the save icon visibility in the tab label.
  protected isTabDirty( lap: LapName ) {
    return this.dirtyLaps.has( lap ) ;
  }

  // Accepts an explicit lap rather than defaulting to activeLap so it can be called for auto-save on tab switch.
  // Captures questionAttempt before the async call so a mid-flight question change doesn't corrupt state.
  protected saveLap( lap: LapName ) {
    const analysis = this.workingCopies[ lap ] ;
    const attempt  = this.questionAttempt ;
    if( !analysis || !attempt ) return ;

    this.apiSvc.saveQAttemptLapAnalysis( attempt.id, analysis )
      .then( r => {
        attempt.execScore          = r.attemptScore ;
        attempt.lapAnalysis[ lap ] = { ...analysis } ;  // keep lapAnalysis in sync for re-selection without re-fetch
        this.dirtyLaps.delete( lap ) ;
      })
      .catch( () => {
        alert( `Failed to save lap ${lap}. Please try again.` ) ;
      }) ;
  }

  protected getEvaluationStatusBg() {

    const ansSubStatus = this.questionAttempt!.answerSubmitStatus ;
    const evalStatus = this.questionAttempt!.evaluationStatus ;

    if( ansSubStatus == "ANSWERED" ||
        ansSubStatus == "ANS_AND_MARKED_FOR_REVIEW" ) {

      if( evalStatus == "CORRECT" ) {
        return "#bcffbf" ;
      }
      else if( evalStatus == "INCORRECT" ) {
        return "#ff909d" ;
      }
      else if( evalStatus == "PARTIAL" ) {
        return "#fdd7a4" ;
      }
    }
    return "#e4e4e4" ;
  }
}
