import { Component } from '@angular/core' ;
import { ViewChild } from '@angular/core' ;
import { CommonModule } from '@angular/common' ;

import { PageToolbarComponent } from "lib-core" ;
import { LocalStorageService } from "lib-core" ;

import { TestSetupComponent } from "./components/test-setup/test-setup.component";
import { TestPlayComponent } from "./components/test-play/test-play.component";
import { GameConfig } from "./new-test.config";
import { TestResultComponent } from "./components/test-result/test-result.component";
import { Question } from "./question";
import {QuestionGenerator} from "./components/test-play/question-generator";

@Component({
  selector: 'feature-new-test',
  standalone: true,
  imports: [
    CommonModule,
    PageToolbarComponent,
    TestSetupComponent, TestPlayComponent, TestResultComponent
  ],
  templateUrl: './new-test.component.html',
  styleUrl: './new-test.component.css'
})
export class NewTestComponent {

  private readonly LS_CFG_KEY:string = 'sc-memgym-arithmetic-cfg' ;
  private readonly FOCUS_DURATION:number = 5 ;

  title:string = "New Test" ;

  state: 'setup' | 'focus' | 'play' | 'results' = 'setup' ;

  focusTimeLeft:number = 5 ;

  gameCfg:GameConfig = {
    duration: 120,
    useVirtualNumpad: true,
    addition: {
      enabled: true,
      lhsMin: 5,
      lhsMax: 25,
      rhsMin: 5,
      rhsMax: 25
    },
    subtraction: {
      enabled: false
    },
    multiplication: {
      enabled: false,
      lhsMin: 2,
      lhsMax: 12,
      rhsMin: 2,
      rhsMax: 100
    },
    division: {
      enabled: false
    }
  }

  @ViewChild( TestPlayComponent )
  private playComponent!: TestPlayComponent ;

  @ViewChild( TestResultComponent )
  private resultComponent!: TestResultComponent ;

  private debugFlag:boolean = false ;

  constructor( private localStorageSvc: LocalStorageService ) {}

  ngOnInit() {
    const cfgStr = localStorage.getItem( this.LS_CFG_KEY ) ;
    if( cfgStr != null ) {
      this.gameCfg = JSON.parse( cfgStr ) ;
    }
  }

  // This method is called when the user clicks 'Ok' on the test-result page.
  handleSetupTestEvent() {
    this.state = 'setup' ;
  }

  // This method is called upon when the user submits the test configuration
  // in the test-setup component.
  handleStartTestEvent( config:any ) {

    if( this.debugFlag ) {
      this.localStorageSvc.setItem( this.LS_CFG_KEY, JSON.stringify( this.gameCfg ) ) ;
      this.handleEndTestEvent( this.generateTestRestults() ) ;
      return ;
    }

    this.localStorageSvc.setItem( this.LS_CFG_KEY, JSON.stringify( this.gameCfg ) ) ;

    if( this.FOCUS_DURATION <= 0 ) {
      this.state = 'play' ;
      this.playComponent.startGame( this.gameCfg ) ;
    }
    else {
      this.state = 'focus' ;
      this.focusTimeLeft = this.FOCUS_DURATION ;
      setTimeout( ()=>{ this.focus() ; }, 1000 ) ;
    }
  }

  focus(){

    this.focusTimeLeft-- ;
    if( this.focusTimeLeft > 0 ) {
      setTimeout( ()=>{ this.focus() ; }, 1000 ) ;
    }
    else {
      this.state = 'play' ;
      this.playComponent.startGame( this.gameCfg ) ;
    }
  }

  // This method is called upon when the test completes in the test-play
  // component.
  handleEndTestEvent( testResults:Question[] ):void {
    this.state = 'results' ;
    this.resultComponent.showResults( this.gameCfg, testResults ) ;
  }

  private generateTestRestults():Question[] {
    const questions:Question[] = [] ;
    const qGen:QuestionGenerator = new QuestionGenerator( this.gameCfg ) ;
    for( let i=0; i<50; i++ ) {
      let q = qGen.getNextQuestion() ;
      if( q !== undefined ) {
        q.timeTakenMillis = Math.floor( Math.random()*1200 + 300 ) ;
        questions.push( q ) ;
      }
    }
    return questions ;
  }
}
