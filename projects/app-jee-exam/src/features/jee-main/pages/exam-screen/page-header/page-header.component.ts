import { Component, inject } from '@angular/core';
import { NgOptimizedImage } from "@angular/common";
import { JeeMainService } from "../../../jee-main.service";

@Component({
  selector: 'page-header',
  imports: [
    NgOptimizedImage
  ],
  templateUrl: './page-header.component.html',
  styleUrl: './page-header.component.css'
})
export class PageHeaderComponent {

  examSvc = inject( JeeMainService ) ;

  protected getRemainingTime() {

    let timeLeft = this.examSvc.timeLeftInSeconds ;
    const hours = Math.floor( timeLeft / 3600 );
    const minutes = Math.floor( ( timeLeft % 3600 ) / 60 );
    const seconds = timeLeft % 60;

    return `${ hours.toString().padStart( 2, '0' ) }:` +
           `${ minutes.toString().padStart( 2, '0' ) }:` +
           `${ seconds.toString().padStart( 2, '0' ) }`;
  }
}
