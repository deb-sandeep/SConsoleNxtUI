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

  readonly MIN_LAP_DURATION = 5 ;
  readonly execScoreCells = Array.from( { length: 10 }, ( _, i ) => i ) ;

  apiSvc = inject( ExamApiService ) ;

  observationTagsMaster: string[] = [] ;

  questionAttempt: ExamQuestionAttemptSO | null = null ;
  visibleLaps: LapName[] = [] ;
  activeLap: LapName | null = null ;

  failedLaps = new Set<LapName>() ;
  dirtyLaps = new Set<LapName>() ;

  private readonly NOTE_AUTOSAVE_DEBOUNCE_MS = 1000 ;
  private pendingNoteSave: { lap: LapName, timer: ReturnType<typeof setTimeout> } | null = null ;

  ngOnInit() {
    this.apiSvc.getQAttemptLapAnalysisObservationList().then( result => {
      this.observationTagsMaster = result ;
    }) ;
  }

  ngOnDestroy() {
    this.flushPendingNoteSave() ;
  }

  // Called by the parent (exam-eval-display) when the user selects a different question.
  setQuestionAttempt( attempt: ExamQuestionAttemptSO ) {
    this.flushPendingNoteSave() ;
    this.questionAttempt = attempt ;
    this.failedLaps.clear() ;
    this.dirtyLaps.clear() ;
    this.visibleLaps = LAP_ORDER.filter( lap => (attempt.lapDurations[ lap ] ?? 0) > this.MIN_LAP_DURATION ) ;
    this.activeLap = this.visibleLaps[0] ?? null ;
    if( this.activeLap ) {
      this.ensureAnalysis( this.activeLap ) ;
    }
  }

  // Lazily initialises a default analysis entry directly on the canonical lapAnalysis map.
  private ensureAnalysis( lap: LapName ) {
    const attempt = this.questionAttempt! ;
    if( !attempt.lapAnalysis ) attempt.lapAnalysis = {} ;
    if( !attempt.lapAnalysis[ lap ] ) {
      attempt.lapAnalysis[ lap ] = { lapName: lap, score: 0, note: '', observations: [] } ;
    }
  }

  // Called when the user clicks a lap tab. Flushes any pending debounced note-save before switching.
  protected switchTab( lap: LapName ) {
    this.flushPendingNoteSave() ;
    this.ensureAnalysis( lap ) ;
    this.activeLap = lap ;
  }

  // Convenience accessor used by the template to bind form controls to the active lap's canonical analysis.
  protected get currentAnalysis(): ExamQuestionAttemptLapAnalysisSO | null {
    return this.activeLap ? ( this.questionAttempt?.lapAnalysis?.[ this.activeLap ] ?? null ) : null ;
  }

  // Derives the tags not yet selected for the active lap; drives the clickable pool (section F).
  protected get availableObservations(): string[] {
    const selected = new Set( this.currentAnalysis?.observations ?? [] ) ;
    return this.observationTagsMaster.filter( o => !selected.has( o ) ) ;
  }

  // Immediately saves the active lap. Used for discrete, deliberate edits (rating, tag add/remove).
  protected saveActiveLapNow() {
    if( !this.activeLap ) return ;
    this.dirtyLaps.add( this.activeLap ) ;
    this.saveLap( this.activeLap ) ;
  }

  // Debounces saving the active lap. Used for the free-text note, which fires on every keystroke.
  protected scheduleNoteAutosave() {
    if( !this.activeLap ) return ;
    this.dirtyLaps.add( this.activeLap ) ;
    if( this.pendingNoteSave ) clearTimeout( this.pendingNoteSave.timer ) ;
    const lap = this.activeLap ;
    this.pendingNoteSave = {
      lap,
      timer: setTimeout( () => {
        this.pendingNoteSave = null ;
        this.saveLap( lap ) ;
      }, this.NOTE_AUTOSAVE_DEBOUNCE_MS ),
    } ;
  }

  // Immediately saves and clears any pending debounced note-save, e.g. before switching tabs/questions.
  private flushPendingNoteSave() {
    if( !this.pendingNoteSave ) return ;
    clearTimeout( this.pendingNoteSave.timer ) ;
    const lap = this.pendingNoteSave.lap ;
    this.pendingNoteSave = null ;
    this.saveLap( lap ) ;
  }

  // Called when the user clicks a tag in the available pool (F); moves it to the selected chips (E).
  protected addObservation( obs: string ) {

    this.currentAnalysis!.observations.push( obs ) ;

    if( obs === 'PERFECT_EXECUTION' ) {
      this.currentAnalysis!.score = 10 ;
    }
    else if( obs === 'ACCIDENTAL_TOUCH' ) {
      this.currentAnalysis!.score = 0 ;
    }
    else {
      this.currentAnalysis!.score = 2 ;
    }

    this.saveActiveLapNow() ;

    if( obs === 'PERFECT_EXECUTION' ) {
      const indexOfActiveLap = this.visibleLaps.indexOf( this.activeLap! ) ;
      const indexOfNextLap = indexOfActiveLap + 1 ;
      const nextLap = this.visibleLaps[ indexOfNextLap ] ;

      if( nextLap ) {
        this.switchTab( nextLap ) ;
      }
      // else: saveActiveLapNow() above already saved this lap.
    }
  }

  // Called when the user clicks × on a selected chip (E); returns the tag to the available pool (F).
  protected removeObservation( obs: string ) {
    if( !this.currentAnalysis ) return ;
    this.currentAnalysis.observations = this.currentAnalysis.observations.filter( o => o !== obs ) ;
    this.saveActiveLapNow() ;
  }

  // Drives the failed-save indicator in the tab label.
  protected isLapSaveFailed( lap: LapName ) {
    return this.failedLaps.has( lap ) ;
  }

  // Drives the unsaved-edits indicator (tab top border) in the tab label.
  protected isLapDirty( lap: LapName ) {
    return this.dirtyLaps.has( lap ) ;
  }

  // Retries a failed autosave for a specific lap.
  protected retryFailedSave( lap: LapName, event: MouseEvent ) {
    event.stopPropagation() ;
    this.saveLap( lap ) ;
  }

  // Accepts an explicit lap rather than defaulting to activeLap so it can be called for auto-save on tab switch.
  // Captures questionAttempt before the async call so a mid-flight question change doesn't corrupt state.
  protected saveLap( lap: LapName ) {
    const analysis = this.questionAttempt?.lapAnalysis?.[ lap ] ;
    const attempt  = this.questionAttempt ;
    if( !analysis || !attempt ) return ;

    this.apiSvc.saveQAttemptLapAnalysis( attempt.id, analysis )
      .then( r => {
        attempt.execScore = r.attemptScore ;
        this.failedLaps.delete( lap ) ;
        this.dirtyLaps.delete( lap ) ;
      })
      .catch( () => {
        this.failedLaps.add( lap ) ;
      }) ;
  }

  getLapScore( lap: LapName ): number | null {
    const saved = this.questionAttempt?.lapAnalysis?.[ lap ] ;
    return saved && saved.score > 0 ? saved.score : null ;
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
