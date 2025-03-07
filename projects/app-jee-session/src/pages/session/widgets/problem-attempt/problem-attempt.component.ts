import { Component, inject, input } from '@angular/core';
import { SessionStateService } from "../../../../service/session-state.service";
import { DurationPipe } from "../../../../pipes/duration.pipe";
import { Session } from "../../../../entities/session";
import { ActionButtonComponent } from "../action-button/action-button.component";
import { TopicProblemSO } from "@jee-common/master-data-types";
import { ProblemAttempt } from "../../../../entities/problem-attempt";
import { NgClass, NgIf } from "@angular/common";
import { FormsModule } from "@angular/forms";

@Component({
  selector: 'problem-attempt',
  imports: [
    DurationPipe,
    ActionButtonComponent,
    NgIf,
    FormsModule,
    NgClass
  ],
  templateUrl: './problem-attempt.component.html',
  styleUrl: './problem-attempt.component.css'
})
export class ProblemAttemptComponent {

  // ['Assigned',	'Correct',	'Incorrect',	'Later', 'Pigeon',	'Pigeon Kill',	'Purge',	'Reassign',	'Redo']
  readonly actionMatrix:Record<string, string[]> = {
    'Assigned': ['Correct',	'Incorrect',	'Later', 'Pigeon',	'Purge', 'Reassign',	'Redo'],
    'Later': ['Correct',	'Incorrect',	'Later', 'Pigeon',	'Purge', 'Reassign',	'Redo'],
    'Redo': ['Correct',	'Incorrect',	'Later', 'Pigeon',	'Reassign',	'Redo'],
    'Pigeon' : ['Pigeon', 'Pigeon Kill', 'Purge', 'Reassign', 'Redo']
  } ;

  private stateSvc = inject( SessionStateService ) ;
  protected session:Session = this.stateSvc.session ;
  protected problemAttempt: ProblemAttempt = this.session.currentProblemAttempt! ;
  protected problem:TopicProblemSO = this.session.currentProblemAttempt!.problem ;

  protected autoPlay = false ;

  showAutoPlay = input( false ) ;

  isValidAction( action:string ) {
    return this.actionMatrix[ this.problem.problemState ].includes( action ) ;
  }

  async endProblemAttempt( targetState:string ) {
    await this.stateSvc.session.endProblemAttempt( targetState ) ;
  }

  getProblemIcon( state: string ) {
    switch( state ) {
      case 'Assigned': return 'bi-crosshair icon' ;
      case 'Later': return 'bi-calendar2-event icon' ;
      case 'Redo': return 'bi-clockwise icon' ;
      case 'Pigeon': return 'bi-twitter icon' ;
      default: return 'bi-crosshair icon' ;
    }
  }
}
