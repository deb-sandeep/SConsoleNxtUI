import { Component, computed, inject, OnDestroy, OnInit, signal } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';

import { RestApiService } from "../../service/rest-api.service";
import { StateService } from "../../service/state.service";
import { WebSocketService } from "../../service/web-socket.service";
import { UIHelperService } from "../../service/ui-helper.service";
import { BurnChartVO, ProblemStateBreakdown } from "../../service/response-payload.types";
import { BurnChartComponent } from "@jee-common/widgets/burn-chart/burn-chart.component";
import { L30BurnChartComponent } from "./widgets/l30-burn-chart/l30-burn-chart.component";
import { ProblemStateTableComponent } from "./widgets/problem-state-table/problem-state-table.component";

@Component({
  selector: 'app-topic-detail-screen',
  imports: [
    RouterLink,
    BurnChartComponent,
    L30BurnChartComponent,
    ProblemStateTableComponent,
  ],
  templateUrl: './topic-detail-screen.component.html',
  styleUrl: './topic-detail-screen.component.css'
})
export class TopicDetailScreenComponent implements OnInit, OnDestroy {

  private restApiSvc = inject( RestApiService ) ;
  private wsSvc = inject( WebSocketService ) ;
  private activeRoute = inject( ActivatedRoute ) ;

  stateSvc: StateService = inject( StateService ) ;
  uiSvc: UIHelperService = inject( UIHelperService ) ;

  topicId: number = Number( this.activeRoute.snapshot.params[ 'topicId' ] ) ;
  burnChart = signal<BurnChartVO | null>( null ) ;

  // Live websocket push overrides the initial REST snapshot for volatile fields, once it arrives.
  numProblemsLeft    = computed( () => this.stateSvc.topicDetailState()?.numProblemsLeft    ?? this.burnChart()?.status.numProblemsLeft ?? 0 ) ;
  currentBurnRate    = computed( () => this.stateSvc.topicDetailState()?.currentBurnRate    ?? this.burnChart()?.status.currentBurnRate ?? 0 ) ;
  requiredBurnRate   = computed( () => this.stateSvc.topicDetailState()?.requiredBurnRate   ?? this.burnChart()?.status.requiredBurnRate ?? 0 ) ;
  numOvershootDays   = computed( () => this.stateSvc.topicDetailState()?.numOvershootDays   ?? this.burnChart()?.status.numOvershootDays ?? 0 ) ;
  burnStressScore    = computed( () => this.stateSvc.topicDetailState()?.burnStressScore    ?? this.burnChart()?.status.burnStressScore ?? 0 ) ;
  burnStressZone     = computed( () => this.stateSvc.topicDetailState()?.burnStressZone     ?? this.burnChart()?.status.scoreLabel ?? '' ) ;
  burnStressZoneColor = computed( () => this.stateSvc.topicDetailState()?.burnStressZoneColor ?? this.burnChart()?.burnStressZoneColor ?? '#ffffff' ) ;
  numProblemsSolvedToday = computed( () => this.stateSvc.topicDetailState()?.numProblemsSolvedToday ?? this.burnChart()?.numProblemsSolvedToday ?? 0 ) ;

  numTotalProblems     = computed( () => this.burnChart()?.plan.numTotalProblems ?? 0 ) ;
  numProblemsCompleted = computed( () => this.numTotalProblems() - this.numProblemsLeft() ) ;
  originalBurnRate     = computed( () => this.burnChart()?.plan.originalBurnRate ?? 0 ) ;

  overshootColor      = computed( () => this.numOvershootDays() <= 0 ? GOOD_COLOR : BAD_COLOR ) ;
  currentBurnColor     = computed( () => this.currentBurnRate() >= this.requiredBurnRate() ? GOOD_COLOR : BAD_COLOR ) ;
  solvedTodayColor     = computed( () => this.numProblemsSolvedToday() >= this.requiredBurnRate() ? GOOD_COLOR : BAD_COLOR ) ;
  requiredBurnColor    = computed( () => this.requiredBurnRate() > this.originalBurnRate() ? BAD_COLOR : GOOD_COLOR ) ;

  allTimeProblemState = computed<ProblemStateBreakdown>( () =>
    this.stateSvc.topicDetailState()?.allTimeProblemState ?? this.burnChart()?.allTimeProblemState ?? EMPTY_BREAKDOWN ) ;
  todayProblemState = computed<ProblemStateBreakdown>( () =>
    this.stateSvc.topicDetailState()?.todayProblemState ?? this.burnChart()?.todayProblemState ?? EMPTY_BREAKDOWN ) ;

  ngOnInit() {
    this.stateSvc.setActiveTopicDetailId( this.topicId ) ;
    this.wsSvc.requestTopicDetails( this.topicId ) ;
    this.restApiSvc.getBurnChart( this.topicId ).then( vo => this.burnChart.set( vo ) ) ;
  }

  ngOnDestroy() {
    this.stateSvc.setActiveTopicDetailId( null ) ;
  }
}

const GOOD_COLOR = '#00cc44' ;
const BAD_COLOR  = '#cc3333' ;

const EMPTY_BREAKDOWN: ProblemStateBreakdown = {
  totalCount: 0, numAssigned: 0, numCorrect: 0, numIncorrect: 0, numLater: 0,
  numPigeons: 0, numPigeonsExplained: 0, numPigeonsSolved: 0, numPurged: 0,
  numReassign: 0, numRedo: 0,
} ;
