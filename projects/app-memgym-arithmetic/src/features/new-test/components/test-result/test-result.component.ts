import { Component } from '@angular/core' ;
import { FormsModule } from '@angular/forms' ;
import { Output, EventEmitter } from '@angular/core' ;
import {Question} from "../../question";
import {GameConfig} from "../../new-test.config";

@Component({
  selector: 'test-result',
  standalone: true,
  imports: [ FormsModule ],
  templateUrl: './test-result.component.html',
  styleUrl: './test-result.component.css'
})
export class TestResultComponent {

  @Output()
  setupTestEvent = new EventEmitter<any>() ;

  gameCfg:GameConfig|undefined ;
  answeredQuestions:Question[] = [] ;

  showResults( gameCfg:GameConfig, results: Question[] ) {
    console.log( "Showing results." ) ;
    this.gameCfg = gameCfg ;
    this.answeredQuestions = results ;
  }
}
