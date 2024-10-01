import { Component } from '@angular/core' ;
import { FormsModule } from '@angular/forms' ;
import { Input, Output, EventEmitter } from '@angular/core' ;
import { Observable, Subscription } from 'rxjs' ;

@Component({
  selector: 'test-play',
  standalone: true,
  imports: [ FormsModule ],
  templateUrl: './test-play.component.html',
  styleUrl: './test-play.component.css'
})
export class TestPlayComponent {

  private startGameEventSubscription: Subscription ;

  @Input()
  startGameEvent:Observable<any> ;

  @Output()
  endTestEvent = new EventEmitter<any>() ;

  ngOnInit() {
    console.log( "ngOnInitCalled" ) ;
    this.startGameEventSubscription = this.startGameEvent.subscribe( (gameCfg) => this.startGame(gameCfg) ) ;
  }

  ngOnDestroy() {
    this.startGameEventSubscription.unsubscribe() ;
  }

  private startGame( cfg : any ) {
    console.log( "Test play component received start game event." ) ;
    console.log( cfg ) ;
  }
}
