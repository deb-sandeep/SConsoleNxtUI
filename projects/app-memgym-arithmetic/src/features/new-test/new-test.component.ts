import { Component } from '@angular/core' ;
import { AfterViewInit, ViewChild } from '@angular/core' ;
import { CommonModule } from '@angular/common' ;

import { PageToolbarComponent, PageToolbarActionItemMeta } from "lib-core" ;

import { TestSetupComponent } from "./components/test-setup/test-setup.component";
import { TestPlayComponent } from "./components/test-play/test-play.component";
import { GameConfig } from "./new-test.config";
import {TestResultComponent} from "./components/test-result/test-result.component";

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
  toolbarBtnCfgs:PageToolbarActionItemMeta[] = [] ;

  state: 'setup' | 'play' | 'results' = 'setup' ;

  gameCfg:GameConfig = {
    duration: 5,
    addition: {
      enabled: true,
      lhsMin: 2,
      lhsMax: 100,
      rhsMin: 2,
      rhsMax: 100
    },
    subtraction: {
      enabled: true
    },
    multiplication: {
      enabled: true,
      lhsMin: 2,
      lhsMax: 12,
      rhsMin: 2,
      rhsMax: 100
    },
    division: {
      enabled: true
    }
  }

  @ViewChild( TestPlayComponent )
  private playComponent!: TestPlayComponent ;

  // This method is called when the user clicks 'Ok' on the test-result page.
  handleSetupTestEvent() {
    this.state = 'setup' ;
  }

  // This method is called upon when the user submits the test configuration
  // in the test-setup component.
  handleStartTestEvent(config:any ) {
    this.state = 'play' ;
    console.log( "Received start game event." ) ;
    this.playComponent.startGame( this.gameCfg ) ;
  }

  // This method is called upon when the test completes in the test-play
  // component.
  handleEndTestEvent( testResults:any ):void {
    this.state = 'results' ;
    console.log( testResults ) ;
  }
}
