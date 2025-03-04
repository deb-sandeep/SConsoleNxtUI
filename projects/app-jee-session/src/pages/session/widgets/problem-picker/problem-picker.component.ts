import { Component, inject, output } from '@angular/core';
import { SessionStateService } from "../../../../service/session-state.service";
import { Session } from "../../../../service/session";
import { TopicProblemSO } from "@jee-common/master-data-types";

@Component({
  selector: 'problem-picker',
  imports: [],
  templateUrl: './problem-picker.component.html',
  styleUrl: './problem-picker.component.css'
})
export class ProblemPickerComponent {

  private stateSvc = inject( SessionStateService ) ;
  private session: Session ;

  problems: TopicProblemSO[] ;

  hide = output<void>() ;
  selection = output<TopicProblemSO>() ;

  constructor() {
    this.session = this.stateSvc.session ;
    this.problems = this.session.problems ;
  }

  problemSelected(problem: TopicProblemSO){
    this.selection.emit( problem ) ;
    this.hide.emit() ;
  }
}
