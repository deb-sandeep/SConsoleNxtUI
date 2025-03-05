import { Component, inject } from '@angular/core';
import { NgOptimizedImage } from "@angular/common";
import { SessionStateService } from "../../../../service/session-state.service";
import { Session } from "../../../../service/session";
import { ImgColorCSSGen } from "@jee-common/img-color-cssgen";

@Component({
  selector: 'session-header',
  imports: [
    NgOptimizedImage,
  ],
  templateUrl: './session-header.component.html',
  styleUrl: './session-header.component.css'
})
export class SessionHeaderComponent {

  stateSvc:SessionStateService = inject( SessionStateService ) ;

  session:Session ;

  private imgFilters:Record<string, string> = {} ;

  constructor() {
    this.session = this.stateSvc.session ;
  }

  getCSSImageFilter( targetColor:string ) {
    if( !(targetColor in this.imgFilters) ) {
      if( this.session != null ) {
        let cssGen = new ImgColorCSSGen( targetColor ) ;
        let result:any = cssGen.solve() ;
        // Why save it? Because the css generator is non-deterministic
        this.imgFilters[targetColor] = result.filter + ' opacity(0.2)';
      }
      else {
        return '' ;
      }
    }
    return this.imgFilters[targetColor] ;
  }
}
