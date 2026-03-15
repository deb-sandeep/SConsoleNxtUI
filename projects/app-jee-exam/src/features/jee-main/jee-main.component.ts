import { Component } from '@angular/core';
import { ActivatedRoute, RouterOutlet } from "@angular/router";

@Component({
  selector: 'jee-main',
  imports: [ RouterOutlet ],
  template: `
    <div>
      <router-outlet></router-outlet>
    </div>
  `
})
export class JeeMainComponent {

  private examId: number;

  constructor( private route: ActivatedRoute ) {}

  ngOnInit() {
    this.route.paramMap.subscribe( pm => {
      this.examId = Number( pm.get( 'examId' ) ) ;
      if( !isNaN( this.examId ) ){
        console.log( `Exam id ${this.examId}` ) ;
      }
    })
  }
}
