import { Component, inject, OnInit, signal } from '@angular/core';
import { ActivatedRoute, RouterLink } from "@angular/router";
import { DatePipe, NgClass } from "@angular/common";
import { NgbRating } from "@ng-bootstrap/ng-bootstrap";
import { DurationPipe } from "lib-core";
import { ProblemAttemptSO, TopicProblemSO } from "@jee-common/util/master-data-types";
import { SConsoleUtil } from "@jee-common/util/common-util";
import { ProblemApiService } from "@jee-common/services/problem-api.service";

type StateButton = {
  targetState: string,
  label: string,
  icon: string,
  btnClass: string,
}

const STATE_BUTTONS: StateButton[] = [
  { targetState: 'Pigeon',    label: 'Pigeon',    icon: 'bi-twitter',            btnClass: 'btn-primary'   },
  { targetState: 'Redo',      label: 'Redo',      icon: 'bi-arrow-clockwise',    btnClass: 'btn-warning'   },
  { targetState: 'Correct',   label: 'Correct',   icon: 'bi-check-lg',           btnClass: 'btn-success'   },
  { targetState: 'Incorrect', label: 'Incorrect', icon: 'bi-x-lg',               btnClass: 'btn-danger'    },
  { targetState: 'Reassign',  label: 'Reassign',  icon: 'bi-signpost-split',     btnClass: 'btn-secondary' },
  { targetState: 'Purge',     label: 'Purge',     icon: 'bi-box-arrow-up-right', btnClass: 'btn-danger'    },
] ;

@Component({
  selector: 'app-problem-attempts-screen',
  imports: [
    RouterLink,
    DatePipe,
    NgClass,
    DurationPipe,
    NgbRating,
  ],
  templateUrl: './problem-attempts-screen.component.html',
  styleUrl: './problem-attempts-screen.component.css'
})
export class ProblemAttemptsScreenComponent implements OnInit {

  protected readonly SConsoleUtil = SConsoleUtil ;
  protected readonly stateButtons = STATE_BUTTONS ;

  private problemApiSvc = inject( ProblemApiService ) ;
  private activeRoute = inject( ActivatedRoute ) ;

  topicId: number = Number( this.activeRoute.snapshot.params[ 'topicId' ] ) ;
  problemId: number = Number( this.activeRoute.snapshot.params[ 'problemId' ] ) ;
  returnFilter: string = this.activeRoute.snapshot.queryParams[ 'filter' ] ?? 'total' ;

  problem = signal<TopicProblemSO | null>( null ) ;
  problemAttempts = signal<ProblemAttemptSO[]>( [] ) ;
  loaded = signal( false ) ;

  async ngOnInit() {
    this.problem.set( await this.problemApiSvc.getProblem( this.problemId ) ) ;
    await this.refreshProblemAttempts() ;
    this.loaded.set( true ) ;
  }

  async changeProblemState( targetState: string ) {
    await this.problemApiSvc.changeProblemState( [ this.problemId ], this.topicId, targetState ) ;
    this.problem.update( p => p ? { ...p, problemState: targetState } : p ) ;
    await this.refreshProblemAttempts() ;
  }

  async deleteProblemAttempt( pa: ProblemAttemptSO ) {
    await this.problemApiSvc.deleteProblemAttempt( pa.id ) ;
    await this.refreshProblemAttempts() ;
    this.problem.set( await this.problemApiSvc.getProblem( this.problemId ) ) ;
  }

  async onRatingChange( difficultyLevel: number ) {
    this.problem.update( p => p ? { ...p, difficultyLevel } : p ) ;
    await this.problemApiSvc.updateProblemDifficultyLevel( this.problemId, difficultyLevel ) ;
  }

  private async refreshProblemAttempts() {
    const attempts = await this.problemApiSvc.getProblemAttempts( this.problemId ) ;
    attempts.sort( ( a, b ) => new Date( b.startTime ).getTime() - new Date( a.startTime ).getTime() ) ;
    this.problemAttempts.set( attempts ) ;
  }
}
