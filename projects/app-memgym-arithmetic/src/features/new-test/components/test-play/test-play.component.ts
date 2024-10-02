import { Component } from '@angular/core' ;
import { FormsModule } from '@angular/forms' ;
import { Output, EventEmitter } from '@angular/core' ;

@Component({
  selector: 'test-play',
  standalone: true,
  imports: [ FormsModule ],
  templateUrl: './test-play.component.html',
  styleUrl: './test-play.component.css'
})
export class TestPlayComponent {

  @Output()
  endTestEvent = new EventEmitter<any>() ;

  timeLeft:number = 0 ;

  startGame( cfg : any ) {
    this.timeLeft = cfg.duration ;
    setTimeout( ()=>{ this.decrementTimeLeft() ; }, 500 ) ;
  }

  decrementTimeLeft() {
    this.timeLeft-- ;
    if( this.timeLeft > 0 ) {
      setTimeout( ()=>{ this.decrementTimeLeft() }, 500 ) ;
    }
    else {
      this.endTestEvent.emit( "Test over" ) ;
    }
  }
}
