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
  catProblems: Record<string, TopicProblemSO[]> = {} ;

  hide = output<void>() ;
  selection = output<TopicProblemSO>() ;

  constructor() {
    this.session = this.stateSvc.session ;
    this.problems = this.session.problems ;
    this.categorizeProblems() ;
  }

  private categorizeProblems() {
    this.problems.forEach( p => {
      const key = this.getCategoryKey( p ) ;
      let problemList:TopicProblemSO[] = [] ;
      if( key in this.catProblems ) {
        problemList = this.catProblems[key] ;
      }
      else {
        this.catProblems[key] = problemList ;
      }
      problemList.push( p ) ;
    }) ;
  }

  private getCategoryKey( p: TopicProblemSO ) {
    return p.bookShortName + "/" + p.chapterNum + "/" + p.chapterName ;
  }

  problemSelected(problem: TopicProblemSO){
    this.selection.emit( problem ) ;
    this.hide.emit() ;
  }

  protected readonly Object = Object;
}
