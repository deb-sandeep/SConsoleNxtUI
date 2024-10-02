import { Component } from '@angular/core' ;
import { FormsModule } from '@angular/forms' ;
import { Output, EventEmitter } from '@angular/core' ;

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

  showResults( results : any ) {
    console.log( "Showing results." ) ;
  }
}
