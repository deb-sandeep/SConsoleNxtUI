import { SessionStateService } from "../../service/session-state.service";
import { inject } from "@angular/core";
import { Router } from "@angular/router";
import { Session } from "../../service/session";
import { ImgColorCSSGen } from "@jee-common/img-color-cssgen";

export class AbstractSession {

  stateSvc:SessionStateService = inject( SessionStateService ) ;
  router: Router = inject( Router ) ;

  session:Session ;

  private sessionTypeImgFilter:string = '' ;

  getSessionTypeCSSImageFilter() {
    if( this.sessionTypeImgFilter === '' ) {
      if( this.session != null ) {
        let cssGen = new ImgColorCSSGen( this.session.sessionType!.color ) ;
        let result:any = cssGen.solve() ;
        // Why save it? Because the css generator is non-deterministic
        this.sessionTypeImgFilter = result.filter + ' opacity(0.1)';
      }
    }
    console.log( `filter = ${this.sessionTypeImgFilter}`) ;
    return this.sessionTypeImgFilter ;
  }
}