import { Component } from '@angular/core' ;
import { CommonModule } from '@angular/common' ;
import { PageToolbarComponent, PageToolbarActionItemMeta } from "lib-core" ;
import { TestSetupComponent } from "./components/test-setup/test-setup.component";

@Component({
  selector: 'feature-new-test',
  standalone: true,
  imports: [ CommonModule, PageToolbarComponent, TestSetupComponent ],
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

  handleStartGameEvent(config:any ) {
    console.log( "Starting new game." ) ;
  }
}
