import { Component, inject, output } from '@angular/core';
import { SessionStateService } from "../../../../service/session-state.service";
import { Session } from "../../../../entities/session";
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

  protected readonly Object = Object;

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
