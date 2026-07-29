import { Component, inject } from '@angular/core';
import { ActivatedRoute, RouterOutlet } from "@angular/router";
import { ModalWaitComponent } from "lib-core";
import { JeeAdvancedService } from "./jee-advanced.service";

@Component({
  selector: 'jee-advanced',
  imports: [ RouterOutlet, ModalWaitComponent ],
  template: `
    <modal-wait></modal-wait>
    <div>
      <router-outlet></router-outlet>
    </div>
  `
})
export class JeeAdvancedComponent {

  private examSvc = inject( JeeAdvancedService ) ;

  constructor( private route: ActivatedRoute ) {}

  ngOnInit() {
    this.route.paramMap.subscribe( pm => {
      const examId = Number( pm.get( 'examId' ) ) ;
      if( !isNaN( examId ) ){
        this.examSvc.loadExamConfig( examId ).then() ;
      }
    })
  }
}
