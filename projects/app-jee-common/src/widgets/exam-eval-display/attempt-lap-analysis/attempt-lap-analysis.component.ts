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

const LAP_ORDER: LapName[] = ['L1', 'L2P', 'L2', 'AMR', 'L3P', 'L3.1', 'L3.2'] ;

@Component({
  selector: 'div[qAttemptLapAnalysis]',
  imports: [ NgbRating, FormsModule, NgIf ],
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

  // Fetches the master list of observation tags once; shared across all laps and question attempts.
  ngOnInit() {
    this.apiSvc.getQAttemptLapAnalysisObservationList().then( result => {
      this.observationTagsMaster = result ;
    }) ;
  }

  // Called by the parent (exam-eval-display) when the user selects a different question.
  // Discards all unsaved working copies — intentional; stale edits from the previous question must not bleed through.
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

  // Lazily initialises the in-memory working copy for a lap on first visit.
  // Clones observations[] so edits don't mutate the original lapAnalysis from the server payload.
  private ensureWorkingCopy( lap: LapName ) {
    if( this.workingCopies[ lap ] ) return ;

    const existing = this.questionAttempt?.lapAnalysis?.[ lap ] ;
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
    this.currentAnalysis?.observations.push( obs ) ;
    this.markDirty() ;
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
  // TODO: replace stub with this.apiSvc.saveQAttemptLapAnalysis( this.questionAttempt.id, analysis )
  protected saveLap( lap: LapName ) {
    const analysis = this.workingCopies[ lap ] ;
    if( !analysis || !this.questionAttempt ) return ;
    this.dirtyLaps.delete( lap ) ;
  }
}
