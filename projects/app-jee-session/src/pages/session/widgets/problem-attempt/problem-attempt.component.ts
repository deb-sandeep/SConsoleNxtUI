import { Component, inject, Input, input, output } from '@angular/core';
import { SessionStateService } from "../../../../service/session-state.service";
import { DurationPipe } from "lib-core";
import { Session } from "../../../../entities/session";
import { ActionButtonComponent } from "../action-button/action-button.component";
import { TopicProblemSO } from "@jee-common/util/master-data-types";
import { ProblemAttempt } from "../../../../entities/problem-attempt";
import { NgClass, NgIf } from "@angular/common";
import { FormsModule } from "@angular/forms";
import { NgbRatingModule } from "@ng-bootstrap/ng-bootstrap";
import { SessionNetworkService } from "../../../../service/session-network.service";
import { SConsoleUtil } from "@jee-common/util/common-util";

@Component({
  selector: 'problem-attempt',
  imports: [
    DurationPipe,
    ActionButtonComponent,
    NgIf,
    FormsModule,
    NgClass,
    NgbRatingModule
  ],
  templateUrl: './problem-attempt.component.html',
  styleUrl: './problem-attempt.component.css'
})
export class ProblemAttemptComponent {

  // ['Assigned',	'Correct',	'Incorrect',	'Later', 'Pigeon',	'Pigeon Solved', 'Pigeon Explained', 'Purge',	'Reassign',	'Redo']
  readonly actionMatrix:Record<string, string[]> = {
    'Assigned': ['Correct',	'Incorrect',	'Later', 'Pigeon',	'Purge', 'Reassign',	'Redo'],
    'Later': ['Correct',	'Incorrect',	'Later', 'Pigeon',	'Purge', 'Reassign',	'Redo'],
    'Redo': ['Correct',	'Incorrect',	'Later', 'Pigeon',	'Reassign',	'Redo'],
    'Pigeon' : ['Pigeon', 'Pigeon Explained', 'Purge', 'Reassign', 'Redo', 'Park Pigeon'],
    'Pigeon Solved' : ['Pigeon', 'Pigeon Explained', 'Purge', 'Reassign', 'Redo', 'Park Pigeon'],
  } ;

  private stateSvc = inject( SessionStateService ) ;
  private networkSvc = inject( SessionNetworkService ) ;

  protected readonly SConsoleUtil = SConsoleUtil ;
  protected session:Session = this.stateSvc.session ;
  protected problemAttempt: ProblemAttempt = this.session.currentProblemAttempt! ;
  protected problem:TopicProblemSO = this.session.currentProblemAttempt!.problem ;

  @Input( "autoPlayState" ) autoPlayState = true ;

  showAutoPlay = input( this.autoPlayState ) ;
  autoPlayChange = output<boolean>() ;

  isValidAction( action:string ) {
    return this.actionMatrix[ this.problem.problemState ].includes( action ) ;
  }

  async endProblemAttempt( targetState:string ) {
    const nextProblem = await this.stateSvc.session.endProblemAttempt( targetState ) ;
    if( this.autoPlayState && nextProblem ) {
      await this.session.startProblemAttempt( nextProblem ) ;
    }
  }

  problemRatingChanged() {
    this.networkSvc.updateProblemDifficultyLevel(
      this.problem.problemId,
      this.problem.difficultyLevel
    ).then() ;
  }
}
