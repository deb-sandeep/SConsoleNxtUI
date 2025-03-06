import { Pipe, PipeTransform } from "@angular/core";


@Pipe({
  name: 'duration',
})
export class DurationPipe implements PipeTransform {
  transform( numMillis: number ): string {

    const numSecs = Math.ceil( numMillis/1000 ) ;

    let hours   = Math.floor( numSecs / 3600 ) ;
    let minutes = Math.floor( ( numSecs - (hours * 3600) ) / 60 ) ;
    let seconds = numSecs - ( hours * 3600 ) - ( minutes * 60 ) ;

    let hrStr, minStr, secStr ;

    hrStr  = ( hours   < 10 ) ? '0' + hours   : '' + hours ;
    minStr = ( minutes < 10 ) ? '0' + minutes : '' + minutes ;
    secStr = ( seconds < 10 ) ? '0' + seconds : '' + seconds ;

    return ((hours > 0)? hrStr + ':' : '') + minStr + ':' + secStr ;
  }
}