import { Component } from '@angular/core' ;
import { AfterViewInit, ViewChild } from '@angular/core' ;
import { CommonModule } from '@angular/common' ;

import { PageToolbarComponent, PageToolbarActionItemMeta } from "lib-core" ;

import { TestSetupComponent } from "./components/test-setup/test-setup.component";
import { TestPlayComponent } from "./components/test-play/test-play.component";
import { GameConfig } from "./new-test.config";
import { TestResultComponent } from "./components/test-result/test-result.component";
import { Question } from "./question";

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

  title:string = "New Test" ;

  state: 'setup' | 'focus' | 'play' | 'results' = 'setup' ;

  focusTimeLeft:number = 5 ;

  gameCfg:GameConfig = {
    duration: 120,
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

  // This method is called when the user clicks 'Ok' on the test-result page.
  handleSetupTestEvent() {
    this.state = 'setup' ;
  }

  // This method is called upon when the user submits the test configuration
  // in the test-setup component.
  handleStartTestEvent(config:any ) {
    this.state = 'focus' ;
    this.focusTimeLeft = 5 ;
    setTimeout( ()=>{ this.focus() ; }, 1000 ) ;
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
}
