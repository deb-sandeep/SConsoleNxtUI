import { Component } from '@angular/core' ;
import { CommonModule } from '@angular/common' ;
import { Subject } from 'rxjs' ;

import { PageToolbarComponent, PageToolbarActionItemMeta } from "lib-core" ;

import { TestSetupComponent } from "./components/test-setup/test-setup.component";
import { TestPlayComponent } from "./components/test-play/test-play.component";

@Component({
  selector: 'feature-new-test',
  standalone: true,
  imports: [
      CommonModule,
      PageToolbarComponent,
      TestSetupComponent, TestPlayComponent
  ],
  templateUrl: './new-test.component.html',
  styleUrl: './new-test.component.css'
})
export class NewTestComponent {

  title:string = "New Test" ;
  toolbarBtnCfgs:PageToolbarActionItemMeta[] = [] ;

  mode: 'setup' | 'play' | 'results' = 'setup' ;
  gameCfg = {
    duration: 120,
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

  startGameEventEmitter:Subject<any> = new Subject<any>() ;

  handleStartGameEvent( config:any ) {
    this.mode = 'play' ;
    setTimeout( () => {
      this.startGameEventEmitter.next( config ) ;
    }, 100 ) ;
  }
}
