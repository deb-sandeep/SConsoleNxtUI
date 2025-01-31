import { Component } from '@angular/core' ;
import { CommonModule } from '@angular/common' ;
import { FormsModule } from '@angular/forms' ;
import { Output, EventEmitter } from '@angular/core' ;
import { Question } from "../../question";
import { GameConfig } from "../../new-test.config";

@Component({
    selector: 'test-result',
    imports: [CommonModule, FormsModule],
    templateUrl: './test-result.component.html',
    styleUrl: './test-result.component.css'
})
export class TestResultComponent {

  @Output()
  setupTestEvent = new EventEmitter<any>() ;

  gameCfg:GameConfig|undefined ;
  answeredQuestions:Question[] = [] ;

  private sortMeta = new Map<string,string>([
      ['time',  'ascending'],
      ['index', 'ascending']
  ]) ;

  showResults( gameCfg:GameConfig, results: Question[] ) {
    console.log( "Showing results." ) ;
    this.gameCfg = gameCfg ;
    this.answeredQuestions = results ;
  }

  getRowClass( q:Question ):string {
    let cls="" ;
    if( q.timeTakenMillis <= 1500 ) {
      cls = "table-success" ;
    }
    else if( q.timeTakenMillis <= 2000 ) {
      cls = "table-primary" ;
    }
    else if( q.timeTakenMillis <= 2500 ) {
      cls = "table-warning" ;
    }
    else {
      cls = "table-danger" ;
    }
    return cls ;
  }

  sortBy( key:string ):void {

    const sortDir = this.sortMeta.get( key ) ?? 'ascending' ;
    this.sortMeta.set( key, sortDir === 'ascending' ? 'descending' : 'ascending' ) ;

    if( key === 'time' ) {
      this.answeredQuestions.sort( (q1, q2) => {
        if( sortDir === 'ascending' ) {
          return q1.timeTakenMillis - q2.timeTakenMillis ;
        }
        return q2.timeTakenMillis - q1.timeTakenMillis ;
      }) ;
    }
    else if( key === 'index' ) {
      this.answeredQuestions.sort( (q1, q2) => {
        if( sortDir === 'ascending' ) {
          return q1.seqNo - q2.seqNo ;
        }
        return q2.seqNo - q1.seqNo ;
      }) ;
    }
  }
}
