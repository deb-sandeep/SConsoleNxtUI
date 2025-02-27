import { SessionStateService } from "../../service/session-state.service";
import { inject } from "@angular/core";
import { Router } from "@angular/router";
import { Session } from "../../service/session";
import { ImgColorCSSGen } from "@jee-common/img-color-cssgen";

export class AbstractSession {

  stateSvc:SessionStateService = inject( SessionStateService ) ;
  router: Router = inject( Router ) ;

  session:Session ;

  private imgFilters:Record<string, string> = {} ;

  getCSSImageFilter( targetColor:string ) {
    if( !(targetColor in this.imgFilters) ) {
      if( this.session != null ) {
        let cssGen = new ImgColorCSSGen( targetColor ) ;
        let result:any = cssGen.solve() ;
        // Why save it? Because the css generator is non-deterministic
        this.imgFilters[targetColor] = result.filter + ' opacity(0.15)';
      }
      else {
        return '' ;
      }
    }
    return this.imgFilters[targetColor] ;
  }
}