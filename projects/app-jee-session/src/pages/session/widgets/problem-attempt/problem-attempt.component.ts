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

  // To avoid spending too much time on a single problem and encourage call for assistance,
  // the redo button is hidden under the following situations:
  //    1) Total time spent on the problem is more than 30 minutes
  //    2) Number of attempts (including current) is more than 1 and total time exceeds 20 minutes
  // This would encourage the student to pigeon the problem if the current attempt does not succeed.
  isPigeonFavoredOverRedo() {
      if( this.problemAttempt.totalDuration >= 30*60*1000 ) {
        return true ;
      }
      else if( this.problem.numAttempts + 1 >= 2 ) { // +1 to include the current problem attempt
        if( this.problemAttempt.totalDuration >= 20*60*1000 ) {
          return true ;
        }
      }
      return false ;
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
